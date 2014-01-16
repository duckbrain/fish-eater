from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

class HighScore(db.Model):
    score = db.StringProperty(required=True)
    when = db.DateTimeProperty(auto_now_add=True)
    name = db.StringProperty()

class MainHandler(webapp.RequestHandler):
    def get(self):
        scores = db.GqlQuery(
            'SELECT * FROM HighScore ORDER BY score DESC, name ASC LIMIT 10').fetch(10)
        #write the values out in shortest formed JSON.
        #json = '{status:"ok", ['
        #for s in scores:
        #    json += '{score:' + s.score + ',username:"' + s.name + '"},'
        #json = json[:-1]
        #json += ']}'
        #self.response.out.write(json)

        #Write the values in HTML using the template API.
        self.response.out.write(template.render('template.html', { 'highscores': scores }))

    def post(self):
        scorerecorded = self.request.get('score')
        username = self.request.get('name')
        score = HighScore(
            score = scorerecorded,
            name = username)
        score.put()

        self.redirect('/')

def main():
    application = webapp.WSGIApplication([('/', MainHandler)], debug=True)
    util.run_wsgi_app(application)
if __name__ == '__main__':
    main()
