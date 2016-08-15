(ns noteServer.handler
  (:use ring.middleware.anti-forgery
        ring.util.anti-forgery)
  (:require [compojure.core :refer :all]
            [compojure.route :as route]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [noteServer.database :as db]
            [noteServer.security :as security]
            [noteServer.html :as html]
            [noteServer.json :as json]
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
                  (let [entries (db/query-notes (str/split id #","))]
                    (if (zero? (count entries))
                      (json/error-note)
                      (json/format-notes entries)))
                  (json/error-note)))

           ;; This is for debugging, at least for now
           (GET "/page" []
                (html5
                  {:lang "en"}
                  [:head
                   [:title "Notes!"]
                   (include-js "http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"
                               "script.js")
                   (include-css "style.css")]
                  [:body
                   (html/get-templates)
                   [:section#note-container (html/format-notes (db/query-notes))]]))

           ; TODO filter?
           (GET "/all" [type]
                (case type
                  ;"json" (json/format-notes (db/query-all))
                  "json" (json/format-notes (db/query-notes))
                  "html" (html/format-notes (db/query-notes))
                  ;"xml" (xml/format-notes (db/query-all))
                  "raw" (db/query-notes)
                  (html [:center
                         [:h1 "Unknown Type"]
                         [:p "This should possibly be set to json, to match the older code..."]])))

           (context "/list" []
                    ;(GET "/" [id]
                    ;     (json/format-notes (db/query-list id)))
                    ;(POST "/set-checkbox" [list-id id new-value]
                    ;      (db/change-checkbox! list-id id new-value))
                    ;(POST "/add-item" [list-id text]
                    ;      (println (str list-id ": " text))
                    ;      (j/write-str (db/insert-list-item! list-id text)))
                    (POST "/set-checkbox" [note-id module-id item-id new-value]
                          (println new-value)
                          (println (type new-value))
                          (db/change-checkbox! note-id module-id item-id new-value))
                    ;; retuns [{"generated_key": 'new-id'}]
                    (POST "/add-item" [note-id module-id text]
                          (j/write-str (db/insert-list-item! note-id module-id text)))
                          )

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
