$(function() {
    const TWEET_CONTAINER = 'div.stream ol#stream-items-id li.stream-item[data-item-type="tweet"] div.tweet';
    const TWEET_FOOTER = '.content .stream-item-footer .ProfileTweet-actionList';
    const API_BASE_URL = 'http://127.0.0.1:5000';

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    var twitterIntervalID = null;
    setAddCNBButtonInterval();

    var cnbOpenTweetID = null;

    function addCNBToTweets() {
        let $tweets = $(TWEET_CONTAINER).not('.cnb-btn-inserted');
        $tweets.each(function(index) {
            let $this = $(this);
            let $footer = $this.find(TWEET_FOOTER);
            $footer.prepend(createButton($this.attr('data-item-id')));
            $this.addClass('cnb-btn-inserted');
        });
    }

    function setAddCNBButtonInterval() {
        addCNBToTweets();
        if (twitterIntervalID == null) {
            twitterIntervalID = setInterval(addCNBToTweets, 2000);
        }
    }

    function removeAddCNBButtonInterval() {
        if (twitterIntervalID != null) {
            clearInterval(twitterIntervalID);
            twitterIntervalID = null;
        }
    }

    function createButton(tweetID) {
        let str = '<div class="ProfileTweet-action ProfileTweet-action--CNB js-toggleState">' +
            '<button class="ProfileTweet-actionButton js-actionButton" type="button" data-tweet-id="' + tweetID + '">' +
            '<div class="IconContainer js-tooltip" data-original-title="Give me more context!">' +
            '<span class="Icon Icon--CNB"></span>' +
            '<span class="u-hiddenVisually">Context News Bot</span>' +
            '</div>' +
            '<span class="ProfileTweet-actionCount">' +
            '<span class="ProfileTweet-actionCountForPresentation" aria-hidden="true">CNB</span>' +
            '</span>' +
            '</button>' +
            '</div>';

        let $button = $(str);
        $button.find('button.js-actionButton').off('click').on('click', buttonListener);

        return $button;
    }

    function createContextPanel(tweetID) {
        let $tweet = $('div.tweet[data-tweet-id="' + tweetID + '"]');
        
        $tweet.find('.cnb-loading-text').remove();
        let $loadingElement = $('<h4 class="cnb-loading-text">Loading...</h4>');
        $tweet.append($loadingElement);

        getDataForTweet(tweetID).then((data) => {
            console.log(data);

            if (data['relevant_articles'].length == 0 && data['wiki_urls'].length == 0) {
                $tweet.find('.cnb-loading-text').text('No relevant articles found!');
                return;
            }

            let str = '<div class="news-card-container">';
            for (const [i, datum] of data['relevant_articles'].entries()) {
                let datePublished = new Date(datum['publishedAt']);
                str += '<div class="card news-card card-' + i + '">';
                str += '<div class="card-section">';
                str += '<article class="news-card-article">';
                str += '<em class="news-card-date">' + DAYS[datePublished.getDay()] + ', ' + datePublished.getDate() + ' ' + MONTHS[datePublished.getMonth()] + '</em>';
                str += '<h3 class="news-card-title">' + datum['title'] + '</h3>';
                str += '<p class="news-card-description">' + datum['description'] + '</p>';
                str += '<p><a href="' + datum['url'] + '">Continue reading on ' + datum['source']['name'] + ' </a></p>';

                let colorClass = 'orange';
                if (datum['sentiment_score'] > 0)
                    colorClass = 'green'
                else if (datum['sentiment_score'] < 0)
                    colorClass = 'red'
                str += '<div class="sentiment-circle ' + colorClass + '"></div>';

                str += '</article>' + '</div>' + '</div>';
            }

            for (const [i, wiki] of data['wiki_urls'].entries()) {
                str += '<div class="wikipedia-tag">';
                str += '<div class="keyword keyword-' + i + '">';
                str += '<a href="' + wiki['wiki_url'] + '">' + wiki['entity_name'] + ' [Wikipedia]</a>';
                str += '</div>' + '</div>';
            }
            str += '</div>';

            let $contextPanel = $(str);
            $tweet.append($contextPanel);
            $tweet.find('.cnb-loading-text').remove();
            cnbOpenTweetID = tweetID;
        });
    }

    function getDataForTweet(tweetID) {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": API_BASE_URL + "/tweet",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache",
            },
            "processData": false,
            "data": "{\n\t\"id\": " + tweetID + "\n}"
        }
        return $.ajax(settings);
    }

    function buttonListener() {
        let $this = $(this);
        let btnTweetID = $this.attr('data-tweet-id');

        if (cnbOpenTweetID == null) {
            createContextPanel(btnTweetID);
        } else {
            $('div.tweet[data-tweet-id="' + cnbOpenTweetID + '"]').find('.news-card-container').remove();
            if (btnTweetID != cnbOpenTweetID) {
                createContextPanel(btnTweetID);
            } else {
                cnbOpenTweetID = null;
            }
        }
    }
});
