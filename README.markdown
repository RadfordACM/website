#### A simple landing page for radford.edu/acm

Pretty much everything goes through OrgSync, so this just has some basic
information, links, and news parsed from the OrgSync public RSS feed.

#### Deployment

This repo is on RUCS under `~/gits/website`.  Synch to that repo, then run the
script `~/bin/deploy_index.sh`, which copies the files from the repo to
`public_html` and sets permissions and so forth, without sneezing on the
midatl directories.

(The deplyment script could be called from a Git hook (post-recieve?)
to automate things a tiny bit more.)

#### Libraries and frameworks

- [Skeleton](http://getskeleton.com/)
- [jQuery](https://jquery.com/)
- [Moment.js](http://momentjs.com/)
- [Open Sans](http://www.google.com/fonts/specimen/Open+Sans) (via [Google Fonts](http://www.google.com/fonts))