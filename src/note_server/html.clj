(ns note-server.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [note-server.security :as security])
  )

(defn get-formated-note [note]
  (html
    [:article {:id (:id note)}
     [:h1 (:header note)]
     [:p (:body note)]]))
