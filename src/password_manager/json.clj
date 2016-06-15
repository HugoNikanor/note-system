(ns password-manager.json
  (:require [clojure.data.json :as json]
            [password-manager.security :as security])
  )

(defn create-json [entries]
  (json/write-str (assoc entries :password
