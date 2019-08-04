---
layout: post
title:  "Importing ReSharper issues to SonarQube"
date:   2018-06-22 02:43:00 +0300
categories: resharper sonarqube
---

*Update 2019-08-04*

*If you are using self-hosted SonarQube server, you can consider using [the plugin](https://github.com/Soloplan/resharper-clt-plugin)*

---
In the latest version of SonarQube new fantastic feature was introduced, so-called external analyzers.
The quote from the [official site](https://www.sonarqube.org/sonarqube-7-2/):

> SonarQube 7.2 introduces a generic way to import issues found by 3rd-party analyzers.
> No need to jump from one tool to another, just benefit from a consolidated view in SonarQube. Even better: SonarQube has built-in support for some of the standard analyzers out there.

At the moment of writing, only [TypeScript plugin](https://docs.sonarqube.org/display/PLUG/SonarTS) has out of the box support of the feature. But fortunately, there is [generic issue data](https://docs.sonarqube.org/display/SONAR/Generic+Issue+Data) format, which _allows importing issues from any analyzer_. ReSharper in its turn has free command line tool [Inspect Code](https://www.jetbrains.com/help/resharper/InspectCode.html) which can analyze projects and produce a report in XML format, so all we have to do is to convert ReSharper format to SonarQube format.

Generate ReSharper report part is simple, just run the Inspect Code tool against your solution:
```bash
InspectCode YouSolution.sln --swea -s=INFO -o=ReSharperReport.xml
```

For the next step, I wrote a small .NET core [global tool](https://github.com/olsh/dotnet-reqube) which can convert ReSharper report to SonarQube format. First, you need to install `dotnet-reqube` with the following command.

```bash
dotnet tool install --global dotnet-reqube
```

and do the conversion:

```bash
dotnet-reqube -i ReSharperReport.xml -o SonarQubeReport.json -d YouSolutionDirectory
```

Then, you need to run [Sonar Scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner+for+MSBuild) as usual but with the additional parameter `/d:sonar.externalIssuesReportPaths=SonarQubeReport.json` where JSON file is the `-o` parameter that you pass to `dotnet-reqube`.

That's it after the analysis is complete, you can see issues detected by ReSharper in SonarQube interface.

![R# issues](/images/2018-06-21/resharper-issues.png){: .align-center}

ReSharper issues will be marked with `R#` label.

Please note that the external issues have some limitations:

> * they cannot be managed within SonarQube; for instance, there is no ability to mark them False Positive.
> * the activation of the rules that raise these issues cannot be managed within SonarQube. In fact, external rules are not visible in the Rules page or reflected in any Quality Profile.

I've created [the example project](https://github.com/olsh/resharper-to-sonarqube-example) with a [Cake script](https://github.com/olsh/resharper-to-sonarqube-example/blob/master/build.cake) which do all these steps automatically.

If you have any problems with the integration, please open an issue on [GitHub](https://github.com/olsh/resharper-to-sonarqube-example/issues).
