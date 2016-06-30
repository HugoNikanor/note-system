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
                ; str/split crashed if id is nil
                ; id can be nil if the url contains an unfinished precent encoding
                (let [entries (db/query (str/split id #","))]
                  (if (zero? (count entries))
                    (json/error-note)
                    (json/format-notes entries))))
           (GET "/:type" [type]
                (str type)))
  (route/not-found "Hilarious 404 joke"))


(def app
  (wrap-defaults app-routes site-defaults))
