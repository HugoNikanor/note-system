(ns note-server.handler
  (:use ring.middleware.anti-forgery
        ring.util.anti-forgery)
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [note-server.database :as db]
            [note-server.security :as security]
            [note-server.html :as html]
            [note-server.json :as json]
            [clojure.data.json :as j] ; TODO proper import names
            [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [other.call :refer :all]
            [clojure.string :as str]))

(defroutes app-routes
  (GET "/" [] "Hello World")
  (context "/note" []
           (route/resources "/")
           (GET "/" [id]
                ; since id can be nil
                (if id
                  (let [entries (db/query (str/split id #","))]
                    (if (zero? (count entries))
                      (json/error-note)
                      (json/format-notes entries)))
                  (json/error-note)))
           ; TODO filter?
           (GET "/all" [type]
                (case type
                  "json" (json/format-notes (db/query-all))
                  "html" (html/format-notes (db/query-all))
                  (html [:center
                         [:h1 "Unknown Type"]
                         [:p "This should possibly be set to json, to match the older code..."]])))

           ;(GET "/list" [id]
           (context "/list" []
                    (GET "/" [id]
                         (json/format-notes (db/query-list id)))
                    (POST "/set-checkbox" [list-id id new-value]
                          (db/change-checkbox! list-id id new-value))
                    (POST "/add-item" [list-id text]
                          (println (str list-id ": " text))
                          (j/write-str (db/insert-list-item! list-id text))))
           (context "/token" []
                    (GET "/raw" [] *anti-forgery-token*)
                    (GET "/html" [] (anti-forgery-field)))
           (POST "/update" [id header body]
                 (j/write-str (db/update-note! id header body)))
           (POST "/submit" [header body type]
                 (j/write-str
                   (db/insert! {:type type
                                :header header
                                :body body})))
           (GET "/:type" [type]
                (str "no page: " type)))
  (route/not-found "Hilarious 404 joke"))


(def app
  (wrap-defaults app-routes site-defaults))
