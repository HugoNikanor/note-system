(ns note-server.json
  (:require [clojure.data.json :as json]
            [note-server.security :as security])
  )

(defn get-formated-note [entry]
  (json/write-str (into {} entry)))
  ;(json/write-str {:id "NaN"}))
