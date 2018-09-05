---
layout: post
title:  "Generate release notes with Jira and TeamCity"
date:   2018-09-05 23:00:00 +0300
categories: jira teamcity octopus tfs
---

Recently we switched from TFS to Jira and TeamCity. 
We used to generate release notes with 
[the Octopus extension](https://marketplace.visualstudio.com/items?itemName=octopusdeploy.octopus-deploy-build-release-tasks), 
and it has release notes generation feature out of the box. 
Sadly, the TeamCity plugin does not have the feature, and 
the Octopus team said that they [are not going to implement it](https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/3052975-include-teamcity-changes-links-with-each-release).

But the Octopus support sent the link to the 
[excellent article](https://blogg.bekk.no/generating-a-project-change-log-with-teamcity-and-powershell-45323f956437) 
which shows how you can generate the release notes with commits using PowerShell.
But the script doesn't fit our needs, because we wanted to include linked tasks too, so I extended the script.

The extended script grabs all the changes from a TeamCity build and tries to retrieve the tasks' 
information from Jira and generates a markdown file with release notes. 
After that, you can publish the generated file to the Octopus server with 
[octo.exe](https://octopus.com/docs/api-and-integration/octo.exe-command-line/creating-releases) or 
[TeamCity plugin](https://octopus.com/docs/api-and-integration/teamcity).
I've also created a TeamCity meta-runner which [you can use as a build step in TeamCity](https://confluence.jetbrains.com/display/TCD18/Working+with+Meta-Runner#WorkingwithMeta-Runner-InstallingMeta-Runner). 
The source code is available [here](https://github.com/olsh/teamcity-jira-release-notes/blob/master/GenerateJiraReleaseNotes.xml).
The script was tested on Jira 7 and TeamCity 2018.1

```bash
<#
    This script is based on article:
    https://blogg.bekk.no/generating-a-project-change-log-with-teamcity-and-powershell-45323f956437
#>
$buildId = "%teamcity.build.id%"
$buildNumber = "%build.number"
$releaseVersion = "%changelog.version%"
$outputFile = "%changelog.output.filename%"
$teamcityUrl = "%teamcity.serverUrl%"
$jiraUrl = "%changelog.jira.url%"
$teamCityAuthToken = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("%changelog.teamcity.username%:%changelog.teamcity.password%"))
$jiraAuthToken = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("%changelog.jira.username%:%changelog.jira.password%"))
# Requests TeamCity API and retruns XML
function RequestTeamCityApi($url)
{
    Write-Host "Request TeamCity API: " + $url
    
    $request = [System.Net.WebRequest]::Create($url)     
    $request.Headers.Add("Authorization", "Basic $teamCityAuthToken");
    [xml](new-object System.IO.StreamReader $request.GetResponse().GetResponseStream()).ReadToEnd()    
}
# Requests Jira API and returns JSON
function RequestJiraApi($url)
{
    Write-Host "Request Jira API: " + $url
    $request = [System.Net.WebRequest]::Create($url)     
    $request.Headers.Add("Authorization", "Basic $jiraAuthToken");
    (new-object System.IO.StreamReader $request.GetResponse().GetResponseStream()).ReadToEnd() | ConvertFrom-Json
}
# Formats XML to readable commit message
function FormatCommitsInfo($commitsInfoXml)
{
   Microsoft.PowerShell.Utility\Select-Xml $commitsInfoXml -XPath "/change" |
        foreach { "* $($_.Node.version) - $($_.Node["user"].name, $_.Node["user"].username, $_.Node.username | Select -First 1): $($_.Node["comment"].InnerText)" }
}
# Gets Jira issues by keys and format them
function GetJiraIssues($jiraIssueKeys)
{
    $result = ""
    foreach ($key in $jiraIssueKeys)
    {
        Try 
        {
            $jiraJson = RequestJiraApi($jiraUrl + "/rest/api/2/issue/" + $key)
            $result += "* [$($key)]($($jiraUrl)/browse/$($key)): $($jiraJson.fields.summary)`n"
        }
        Catch
        {
            Write-Host "Unable to get information for $key" 
        }
    }
    return $result
}
$buildInfo = RequestTeamCityApi("$teamcityUrl/app/rest/changes?locator=build:$($buildId)")
$commitsInfo = Microsoft.PowerShell.Utility\Select-Xml $buildInfo -XPath "/changes/change" | 
                foreach { RequestTeamCityApi("$teamcityUrl/app/rest/changes/id:$($_.Node.id)") };
if ($commitsInfo -ne $null)
{
    $jiraIssueKeys = Microsoft.PowerShell.Utility\Select-Xml $commitsInfo -XPath "/change/comment/text()" | 
                    Select-String -Pattern "\b([A-Z]{2,10}-\d+)\b" -AllMatches -CaseSensitive |
                    foreach { $_.Matches } |
                    foreach { $_.Value } |
                    select -uniq
}
if ($releaseVersion -ne $null)
{
	$changelog = "Release notes for version " + $releaseVersion
}
else
{
	$changelog = "Release notes for build " + $buildNumber
}
$changelog += "`n"
if ($jiraIssueKeys -ne $null)
{
    $changelog = "#### Issues:  `n`n"
    $changelog += GetJiraIssues($jiraIssueKeys)
    $changelog += "`n`n"
}
if ($commitsInfo -ne $null)
{
    $changelog += "#### Commit messages:  `n`n "
    $changelog += FormatCommitsInfo($commitsInfo)
}
$changelog > $outputFile
Write-Host "Changelog saved to ${outputFile}"
```

Hope this script will be useful for someone else.
