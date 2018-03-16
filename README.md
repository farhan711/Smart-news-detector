# Smart News Detector Bot

Based on Previous  <a href="https://github.com/farhan711/fake-news-recognition-tool">Fake News Recognition Tool</a>


Smart News Detector Bot is a Chrome extension that attaches itself to your Twitter timeline and provides a one-click solution to retrieving diverse perspectives on an issue. It does this by running the tweet you’ve selected through a natural language pipeline (built on top of Google Cloud Natural Language API) and extracting the important entities in the tweet & sentiments associated with them. Next, it uses this information to form search keywords to retrieve relevant news articles from a variety of reliable sources after which the retrieved articles are scored on their relevance based on our own heuristic (explained below) and the top articles are delivered to the user for easy reading. Along with the top articles.By providing more context to the tweet, we aim to enable users to make a more informed decision on the knowledge they absorb through Twitter.

Retrieving News Articles
We retrieve the initial news articles from the News API by creating search phrases from the important entities mentioned in the tweet, the geotag of the tweet and the name of the user tweeting (if he/she is verified). We differentiate important entities from non-important ones by checking if their type belongs to one of. ``` ["PERSON", "LOCATION", "ORGANIZATION", "EVENT", "WORK_OF_ART", "CONSUMER_GOOD"] ``` Lastly, because tweets can be about incidents that happened weeks/months/years ago, we retrieve all the relevant news articles as opposed to the top headlines at that moment in time.



## Selecting News Articles
Because we had to hack out a prototype in 24 hours and didn’t have access to a dataset that mapped tweets to news articles (to train a custom model or otherwise), we used a custom heuristic to score an article on its relevancy to a tweet. The heuristic uses the entity information outputted by Google’s API in a weighted approach by taking into account every matching entity’s type, saliency & number of mentions:
```
total_score = 0
# matching_entities are the entities found in the tweet and news article.
for entity in matching_entities:
    # REALLY_IMP_ENTITY_IDX are the indexes for "PERSON", "LOCATION", "ORGANIZATION"
    # & "EVENT" entity types.
    if entity.type in REALLY_IMP_ENTITY_IDX:
      total_score += (entity.salience * 1.5) * min(3, len(entity.mentions))
    else:
      total_score += entity.salience * min(3, len(entity.mentions))
      ```
      
Once we score all the articles, we filter them out by source (no more than one article from a single source) and sentiment to deliver a diverse set of views to the user.

## Client User Interface
In order to make the user interface as non-intrusive and intuitive as possible, we simply integrated an action button into every tweet with the other existing buttons as below:


## Problems

- The inability of people to create an internal filter against their own bias has caused the proliferation of false (or somewhat false) information to plague modern society and is slowly leading us to a world with **only polarizing opinions**.

- Today's modern discovery algorithms trap us in personal **'filter bubbles'** by giving us content that agrees with our inherent biases regardless of whether these biases are grounded in reality.

## Solution

We built a machine learning based solution that allows users to fact-check content on Twitter and gain a broader perspective on news items and events. The service helps get rid of biases by understanding the semantics of the tweet's content and suggesting diverse news articles and Wikipedia entries that aim to provide a more rounded and objective perspective.


## Installation

After obtaining (and setting up) the required credentials for the [Twitter API](https://developer.twitter.com/), [News API](https://newsapi.org) & [Google Cloud Natural Language API](https://cloud.google.com/natural-language/), start the server by running:

```
$ pip install -r requirements.txt
$ python server.py
```
Next, clone and install the companion [Chrome extension](https://github.com/farhan711/Smart-news-detector/tree/master/SmartNewsBot) on your computer's Chrome browser. You should now see the Context News Bot button below the tweets on your Twitter timeline!

 <a href="http://farhanansari.in/2018/03/16/smart-news-detector/">Read in Detail here </a>


> **NOTE:** This is developed during IEEE-INDIAConf Code Summit.
