---
layout: post
title:  "Monitor vulnerabilities in .NET Core projects with Snyk"
date:   2018-06-22 02:43:00 +0300
categories: net core snyk
---

In this short note, I'll show how you can continuously monitor dependency vulnerabilities in your project with [Snyk](https://snyk.io/).   
So what's Snyk? Snyk is a service which allows you to detect and monitor vulnerabilities in projects, and it supports various platforms.
For some reason, the documentation for how to set up the scanning for .NET projects almost is not documented, so let's set up the scanning ourselves.

1. Install [Snyk CLI](https://snyk.io/docs/using-snyk/)
```bash
npm install -g snyk
``` 
2. Copy your API token and add a new environment variable with the name `SNYK_TOKEN`, 
you can find it on the [account page](https://snyk.io/account/ )
3. Build the testing solution
4. Run `monitor` command to detect vulnerabilities where `org` parameter is your organization name, you can find it on the settings page.
```bash
snyk monitor --org=olsh --file=YourSolution.sln
```
5. At the moment of writing, the is [an issue with scanning directories with 
multiple package file types](https://github.com/snyk/snyk/issues/142)
so you should execute monitor command for each project which contains `package.json` 
or other package type and specify `obj` directories as arguments.
```bash
snyk monitor --org=olsh youproject/obj yourproject2/obg
```

That's it. Go to your Snyk dashboard and check found vulnerabilities.  
You can also execute these steps on CI server to continuously test your projects,
here is an example of a [cake script](https://github.com/olsh/curl-to-csharp/blob/master/build.cake) 
which [runs on AppVeryor](https://ci.appveyor.com/project/olsh/curl-to-csharp) on each commit and sends the analysis to snyk.