(ns note-server.json
  (:require [clojure.data.json :as json]
            ;[note-server.security :as security])
            [note-server.database :as db]
            )
  )

(defn format-notes [entries]
  (json/write-str
    (into []
          (map #(if (= (:type %) "list")
                  (assoc
                    %
                    :bullets (db/query-list (:id %)))
                  %)
               entries))))

(defn error-note []
  (json/write-str [{:id 0
                    :type "error"
                    :header "Note Not Found!"
                    :body "No note with that id found."}]))
