---
layout: post
title:  "Generate release notes with Jira and TeamCity"
date:   2018-09-05 23:00:00 +0300
categories: jira teamcity octopus tfs
---

*Update 2019-08-24*  
*If you use Jira + TeamCity + Octopus stack. The official Octopus plugin for TeamCity now supports metadata generation, 
give it a try [https://octopus.com/blog/metadata-and-work-items](https://octopus.com/blog/metadata-and-work-items)*

---

Recently we switched from TFS to Jira and TeamCity. 
We used to generate release notes with 
[the Octopus extension](https://marketplace.visualstudio.com/items?itemName=octopusdeploy.octopus-deploy-build-release-tasks), 
and it has release notes generation feature out of the box. 
~~Sadly, the TeamCity plugin does not have the feature, and 
the Octopus team said that they [are not going to implement it](https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/3052975-include-teamcity-changes-links-with-each-release).~~
Starting from Octopus 2019.4 the official TeamCity plugin supports the metadata generation.  

However, the Octopus support sent the link to the 
[excellent article](https://blogg.bekk.no/generating-a-project-change-log-with-teamcity-and-powershell-45323f956437) 
which shows how you can generate the release notes with commits using PowerShell.
However, the script doesn't fit our needs, because we wanted to include linked tasks too, so I extended the script.

The extended script grabs all the changes from a TeamCity build and tries to retrieve the tasks' 
information from Jira and generates a markdown file with release notes. 
After that, you can publish the generated file to the Octopus server with 
[octo.exe](https://octopus.com/docs/api-and-integration/octo.exe-command-line/creating-releases) or 
[TeamCity plugin](https://octopus.com/docs/api-and-integration/teamcity).
I've also created a TeamCity meta-runner which [you can use as a build step in TeamCity](https://confluence.jetbrains.com/display/TCD18/Working+with+Meta-Runner#WorkingwithMeta-Runner-InstallingMeta-Runner). 
The source code is available [here](https://github.com/olsh/teamcity-jira-release-notes/blob/master/GenerateJiraReleaseNotes.xml).
The script was tested on Jira 7 and TeamCity 2018.1

<script src="http://gist-it.appspot.com/http://github.com/olsh/teamcity-jira-release-notes/blob/master/GenerateJiraReleaseNotes.ps1"></script>

Hope this script will be useful for someone else.
