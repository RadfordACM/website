/*
Javascript for displaying items from the Public News RSS Feed from OrgSync.
Matthew Seiler, 2015

I had hoped to use jquery.rss (https://github.com/sdepold/jquery-rss).
It worked fine and has a nice template system, but unfortunately OrgSync
publishes the news entries in reverse chronological order (oldest first).
This is a problem for feed libraries, most of which don't have an option
to reverse the feed entries.

It is also a problem for any solution using the Google Ajax Feed API (like
jquery.rss).  Using that API circumvents CORS issues (see below) and means that
you don't have to parse the XML yourself, but it's designed to return the
first N entries, which is the exact opposite of what we want for this feed
(the _last_ N entries).

See post on OrgSync's disussion board:
https://help.orgsync.com/hc/communities/public/questions/203483866-Reorder-public-news-RSS-feed

Additionally, OrgSync does not have CORS enabled to allow cross-domain resource
requests.  (See http://www.w3.org/wiki/CORS_Enabled)  If we just try to request
the feed, the browser's "same origin" security policy will block the request.

See post on OrgSync's discussion board:
https://help.orgsync.com/hc/communities/public/questions/203559376-Enable-CORS-to-allow-cross-site-requests-to-orgsync-com

To circumvent this, we're using a nice little service called WhateverOrigin.org.
I'll be honest... I don't know how it works.  But the source is here:
https://github.com/ripper234/Whatever-Origin

If any of the above issues are resolved, you'll know because this will break.
 */

(function() {

    /* Creates an array of "item" objects from the feed, and passes it to
       the function specified by the `cont` parameter.
     */
    function getNews(url, cont) {
        // If OrgSync ever enables CORS, we need to stop using WhateverOrigin
        var req_url = 'http://whateverorigin.org/get?url='
                    + encodeURIComponent(url)
                    + '&callback=?';

        $.getJSON(req_url, function(data) {
            var $xml = $(data.contents),
                itemsArray = [];

            $xml.find('channel').children('item').each(function(idx, item) {
                var $item = $(item),
                    itemObj = {
                        title: $item.find("title").text(),
                        /* Should be:
                        link: $item.find("link").text(),
                        ...but for some reason jquery chokes up when creating the DOM for the link element.
                        */
                        link: $item.find("link")[0].nextSibling.nodeValue.trim(),
                        author: $item.find("author").text(),
                        dateRaw: $item.find("pubDate").text(),
                        description: $item.find("description").text()
                    };
                // use moment.js to get a pretty date
                itemObj.date = moment(itemObj.dateRaw).fromNow();
                itemsArray.push(itemObj);
            });

            cont(itemsArray);
        });
    }

    /* Given an "item" object (from getNews), return some HTML for the item.
       Idea for templating with str.match from sdepold/jquery-rss:
       https://github.com/sdepold/jquery-rss/blob/gh-pages/src/jquery.rss.js#L185
     */
    function getItemHtml(item) {
        var template = "<li><a href='{link}'><h6>{title}</h6><p><small>{author}, {date}</small></p></a></li>",
            result = template;
        template.match(/(\{.*?\})/g).forEach(function(match, idx) {
            var key = match.substring(1, match.length - 1);
            result = result.replace(match, item[key]);
        });
        return result;
    }

    /* Creates a function for processes an array of "item" objects.
       The function will insert an unordered list of item/entry HTML
       into the specified div.  Will insert no more than `displayCount`
       items even if more are in the array (not very efficient...)
     */
    function makePresentationFunc(divId, displayCount) {
        var $div = $('#' + divId);
        return function(feedItems) {
            var $list = $div.append("<ul></ul>").children("ul").first(),
                count = 0;
            feedItems.reverse();
            feedItems.forEach(function(item, idx) {
                if (count < displayCount) {
                    $list.append(getItemHtml(item));
                    count += 1;
                }
            });
        };
    }

    /* Go do stuff when the DOM is loaded */
    $(document).ready(function() {
        getNews("https://orgsync.com/100117/news_posts/feed", makePresentationFunc("the-news", 5));
    });

})();