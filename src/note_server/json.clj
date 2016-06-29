(ns note-server.json
  (:require [clojure.data.json :as json]
            [note-server.security :as security])
  )

;(declare fix-time)

(defn get-formated [entries]
  ;"{\"nope\": \"avi\"}")
  (map str entries))

(comment
(defn get-formated [entries]
  (map
    #(json/write-str (map fix-time (security/decrypt-password %)))
    entries)))

(comment
(defn fix-time [entry]
  (assoc entry :date_set 0))
  )
