(ns note-server.handler
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [note-server.database :as db]
            [note-server.security :as security]
            [note-server.html :as html]
            [note-server.json :as json]
            [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [other.call :refer :all]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (route/resources "/")
  (context "/note" []
           ;(context "/:type" [type]
           (GET "/" [id]
                (let [entry (db/query id)]
                  (json/get-formated-note entry)))
           (GET "/:type" [type]
                (str type)))
  (route/not-found "Not Found"))


(def app
  (wrap-defaults app-routes site-defaults))
