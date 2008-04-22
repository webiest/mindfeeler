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
        return simplejson.dumps(a)
    
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
    
  
class MainHandler(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user()
    nickname = ""
    if user:
        nickname = user.nickname()
    else:
        self.redirect(users.create_login_url(self.request.uri))
        
    template_values = {
      'nickname': nickname,
    }
    path = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(path, template_values))

class TouchHandler(webapp.RequestHandler):
  def get(self):
    user = users.get_current_user()
    lastText="";
    
    feel = Feel()
    feel.eventType = self.request.get('eventType')
    feel.x = int(self.request.get('x'))
    feel.y = int(self.request.get('y'))
    feel.hover = int(self.request.get('hover'))    
    feel.username = user.nickname()
    feel.ip = self.request.remote_addr
    feel.keypress = int(self.request.get('keypress'))
    feel.put()
    
    feelQuery = db.Query(Feel)
    totalFeels = feelQuery.count()
    allfeelObjects = feelQuery.fetch(100) #.order("-date").fetch(100)
    feelObjects = feelQuery.filter("keypress >", 0).fetch(100) #.order("-date").fetch(100)
    for feelObj in feelObjects:
        lastText += chr(int(feelObj.keypress))
    self.response.out.write('[' + Json().serializeRow(feel) + ',{"totalFeels":' + str(totalFeels) + ',"lastText":"' + lastText + '"}]')
 

class DataHandler(webapp.RequestHandler):
  def get(self):
      feelsQuery = db.Query(Feel)
      feelObjects = feelsQuery.order("-date").fetch(100)
      self.response.out.write(Json().serializeQuery(feelObjects))
    
def main():
  application = webapp.WSGIApplication([
    ('/', MainHandler),
    ('/touch', TouchHandler),
    ('/data',DataHandler)
  ], debug=True)
  
  wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()
