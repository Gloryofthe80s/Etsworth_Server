Etsworth_Server
===============

This is the back end for Etsworth.

This was an interesting experience - my first time using Node.js or doing server-side code. Consequently, it’s quite “hackish” as a result, and I have learned much since then (using Promises instead of straight callbacks for asynchronous calls, for example). The back end isn’t actively deployed currently, but I used it to make the calls for the Etsy data, and then stubbed out the return data in the front end (dirty, I know). But - this was really just a proof of concept. If the site were ever to *actually* go live, I’d set up some Heroku tasks to automate the re-caching of Etsy assets which would in turn be fed to the front end.  
