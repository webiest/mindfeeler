#!/usr/bin/env python

import cgi
import datetime
import wsgiref.handlers
import os
import datetime

from google.appengine.ext.webapp import template
from google.appengine.ext import db
from google.appengine.api import users
from google.appengine.ext import webapp

class Json:  
    def serializeFeel(self,feel):
        if feel.x is None:
            feel.x = 0
        if feel.y is None:
            feel.y = 0
        if feel.ip is None:
            feel.ip = ""
        if feel.hover is None:
            feel.hover = 0
        if feel.eventType is None:
            feel.eventType = ""
        if feel.keypress is None:
            feel.keypress = 0
        if feel.username is None:
            feel.username = ""
        if feel.date is None:
            feel.dateStr = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')    
        else: feel.dateStr = feel.date.strftime('%Y-%m-%d %H:%M:%S')
        
        return ('{"x":' + str(feel.x) + ',"y":' + str(feel.y) + ',"ip":"' + feel.ip + '"' + ',"hover":' + str(feel.hover) + ',"eventType":"' + feel.eventType + '"' + ',"keypress":' + str(feel.keypress) + ',"username":"' + feel.username + '","date":"'+ feel.dateStr + '"}')
    
    def serializeFeels(self,feelObjects):
        json = Json()
        feelObjectsJSON = "[\n";
        for feelObj in feelObjects:
            feelObjectsJSON += '\t' + json.serializeFeel(feelObj) + ',\n'
        l=len(feelObjectsJSON)
        feelObjectsJSON =  feelObjectsJSON[0:l-2]+ '\n]'
        return feelObjectsJSON

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
    
    json = Json()
    self.response.out.write('[' + json.serializeFeel(feel) + ',{"totalFeels":' + str(totalFeels) + ',"lastText":"' + lastText + '"}]')
    #self.response.out.write('[' + json.serializeFeels(allfeelObjects) + ',{"totalFeels":' + str(totalFeels) + ',"lastText":"' + lastText + '"}]')    


class DataHandler(webapp.RequestHandler):
  def get(self):
      feelsQuery = db.Query(Feel)
      feelObjects = feelsQuery.order("-date").fetch(100)
      json = Json()
      feelObjectsJSON = json.serializeFeels(feelObjects)
      self.response.out.write(feelObjectsJSON)
    
def main():
  application = webapp.WSGIApplication([
    ('/', MainHandler),
    ('/touch', TouchHandler),
    ('/data',DataHandler)
  ], debug=True)
  
  wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()


def dumprow(r):
    import datetime
    a = {}
    for k in r.fields().keys():
        v = getattr(r, k)
        a['id'] = r.key().id()
        if isinstance(v, str):
            a[k] = str(v)
        elif isinstance(v, unicode):
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
    return a

def dumpquery(query):
    s = []
    for r in query:
        s.append(dumprow(r))
    return s 