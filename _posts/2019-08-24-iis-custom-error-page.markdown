---
layout: post
title:  "Custom error pages configuration in ASP.NET MVC 5 and IIS."
date:   2019-08-24 14:00:00 +0300
categories: iis errors mvc5
---

Yeah, this is hard, even Microsoft can't set up custom error pages properly https://www.microsoft.com/en-us/%20/default.aspx

There are many posts on the internet how to set up the custom error pages in ASP.NET MVC and IIS. However, some of them doesn't cover all errors or suggest to have two files for each custom page (`html` and `aspx`). 
Some articles use client redirect, which is not suitable for SEO.
In this short note, we set up custom errors without code duplication, and all cases will be covered. 

First, we need to create `aspx` pages for 404 and 500 errors, let's keep them simple.

<script src="https://gist.github.com/olsh/3b44d8a3b5f0c89b42136ada80d1817f#file-404-aspx"></script>

<script src="https://gist.github.com/olsh/3b44d8a3b5f0c89b42136ada80d1817f#file-500-aspx"></script>

Remove `HandleErrorAttribute`. We don't want to use it because it doesn't support `aspx` files.

Add `customErrors` to `web.config` file, this config is responsible for handling erros which occurred in .NET stack

<script src="https://gist.github.com/olsh/3b44d8a3b5f0c89b42136ada80d1817f#file-web-1-config"></script>

Add `httpErrors` to `web.config`, this one is needed for errors outside .NET stack (for example static files)

<script src="https://gist.github.com/olsh/3b44d8a3b5f0c89b42136ada80d1817f#file-web-1-config"></script>

Set .NET Framework version to 4.6.2 or higher. 
This step is important. Otherwise, custom errors won't work if a URL contains whitespace. 

<script src="https://gist.github.com/olsh/3b44d8a3b5f0c89b42136ada80d1817f#file-web-3-config"></script>

That's it!

Here is a demo project https://github.com/olsh/mvc5-custom-error-pages-example  
The configuration was tested on .NET Framework 4.6.2 and IIS 8.5/10.
