#!/usr/bin/env python

import cgi
import datetime
import wsgiref.handlers
import os
import datetime

from django.utils import simplejson
from google.appengine.ext.webapp import template
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp

class Json:  
    def serializeRow(self,r):
        import datetime
        a = {}
        for k in r.fields().keys():
            v = getattr(r, k)
            a['id'] = r.key().id()
            if v is None:
                    a[k] = ""
            elif isinstance(v, str):
                if(v is None):
                    a[k] = ""
                else:
                    a[k] = str(v)
            elif isinstance(v, unicode):
                if(v is None):
                    a[k] = ""
                else:
                    a[k] = unicode(v)
            elif isinstance(v, datetime.datetime):
                a[k] = v.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(v, datetime.date):
                a[k] = v.strftime('%Y-%m-%d')
            elif isinstance(v, datetime.time):
                a[k] = v.strftime('%H:%M:%S')
            elif isinstance(v, (int, float, list)):
                a[k] = v
            else:
                a[k] = str(v)
        return simplejson.dumps(a).replace('\": ','\":')
    
    def serializeQuery(self,query):
        ObjectsJSON = "";
        for rowObj in query:
            ObjectsJSON += self.serializeRow(rowObj) + ','
        l=len(ObjectsJSON)
        ObjectsJSON =  "[" + ObjectsJSON[0:l-1] + ']'
        return ObjectsJSON
    
class Feel(db.Model):
    date = db.DateTimeProperty()
    eventType = db.StringProperty()
    username = db.StringProperty()
    ip = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)
    x = db.IntegerProperty()
    y = db.IntegerProperty()
    keypress = db.IntegerProperty()
    hover = db.IntegerProperty()
    item = db.IntegerProperty()
    body = db.StringProperty(multiline=True) 
    #body is for ads, hover things, its html of items that get thrown to the user
    
class Stroke(db.Model):
    room  = db.StringProperty()
    user1 = db.StringProperty()
    user2 = db.StringProperty()
    user3 = db.StringProperty()
    user4 = db.StringProperty()
    user5 = db.StringProperty()
    #keeping it at 5 users for now, easy enough to expand    
    
class MainHandler(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user()
    nickname = ""
    if user:
        nickname = user.nickname()
    else:
        self.redirect(users.create_login_url(self.request.uri))
    
    fq = db.Query(Feel)

    template_values = {
      'nickname': nickname,
      'totalFeels': fq.filter('eventType =','click').count(1000)+fq.filter('eventType =','keypress').count(1000),
    }
    path = os.path.join(os.path.dirname(__file__), 'index.html')
    mainRenderedHTML = template.render(path, template_values)
    mainRenderedHTML = mainRenderedHTML[0:len(mainRenderedHTML)-15]
    self.response.out.write(mainRenderedHTML) #flush main HTML
    
    dataJS = '<script>var data_feelObjects = eval(\'' + Json().serializeQuery(DataHandler().getTop100()) + '\');</script>'
    self.response.out.write(dataJS + '</body></html>')
    
class TouchHandler(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user()

    feel = Feel()
    feel.eventType = self.request.get('eventType')
    feel.x = int(self.request.get('x'))
    feel.y = int(self.request.get('y'))
    feel.hover = int(self.request.get('hover'))    
    feel.username = user.nickname()
    feel.ip = self.request.remote_addr
    feel.keypress = int(self.request.get('keypress'))
    feel.put()
    
    fq = db.Query(Feel)
    totalFeels = fq.filter('eventType =','click').count(1000)+fq.filter('eventType =','keypress').count(1000)

    self.response.out.write('[' + Json().serializeRow(feel) + ',{"totalFeels":' + str(totalFeels) + '}]')


class DataHandler(webapp.RequestHandler):
  def get(self):
      top100json = Json().serializeQuery(self.getTop100())
      self.response.out.write(top100json)
  
  def getTop100(self):
      return db.Query(Feel).order("-date").fetch(100)

  def getFeelsAllSortedByDate(self):
      return db.Query(Feel).order("-date").fetch(250)
    
  def getLastText(self):
    lastText = ""
    allfeelObjects = feelQuery.fetch(100) #.order("-date").fetch(100)
    feelObjects = feelQuery.filter("keypress >", 0).fetch(100) #.order("-date").fetch(100)
    for feelObj in feelObjects:
        lastText += chr(int(feelObj.keypress))
        
        
class StrokeHandler(webapp.RequestHandler):
  def get(self):
    strokes = db.GqlQuery("SELECT * FROM Stroke WHERE room = :1", "default").get()
    if strokes:
      strokes.user1 = self.request.get('x')+"x"+self.request.get('y')
    else:
      strokes = Stroke(room="default", user1="200x399")
    db.put(strokes)
    self.response.out.write("")
#    self.response.out.write(str(strokes.user1)+":"+str(strokes.user2))
    
def main():
  application = webapp.WSGIApplication([
    ('/', MainHandler),
    ('/touch', TouchHandler),
    ('/data',DataHandler),
    ('/stroke',StrokeHandler)
  ], debug=True)
  
  wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()
