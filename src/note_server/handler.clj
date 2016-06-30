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
            [other.call :refer :all]
            [clojure.string :as str]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (route/resources "/")
  (context "/note" []
           (GET "/" [id]
                ; since id can be nil
                (if id
                  (let [entries (db/query (str/split id #","))]
                    (if (zero? (count entries))
                      (json/error-note)
                      (json/format-notes entries)))
                  (json/error-note)))
           (POST "/submit" [header body]
                 (db/insert! {:type "note"
                             :header header
                             :body body})
                 "Thanks for your comment")
           (GET "/:type" [type]
                (str "no page: " type)))
  (route/not-found "Hilarious 404 joke"))


(def app
  (wrap-defaults app-routes site-defaults))
