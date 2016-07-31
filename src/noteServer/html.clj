(ns noteServer.html
  (:require [hiccup.core :refer :all]
            [hiccup.page :refer :all]
            [hiccup.def :refer [defhtml]]
            [noteServer.security :as security])
  )

(defhtml format-notes [entries]
  [:h1 "You found me secret"])
  

(defn get-formated-note [note]
  (html
    [:article {:id (:id note)}
     [:h1 (:header note)]
     [:p (:body note)]]))
