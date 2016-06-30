(ns note-server.json
  (:require [clojure.data.json :as json]
            [note-server.security :as security])
  )

(defn format-notes [entries]
  (json/write-str (into [] entries)))

(defn error-note []
  (json/write-str [{:id 0
                    :header "Note Not Found!"
                    :body "No note with that id found."}]))
