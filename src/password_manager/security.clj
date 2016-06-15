(ns password-manager.security
  (:require [org.clojars.tnoda.simple-crypto :as crypt])
  )

; needs to be 16 characters
; this should be properly handled
(def password "abcdefghijklmnop")

(defn decrypt-password [hash-map]
  (assoc hash-map :password (decrypt (:password hash-map))))

(defn encrypt [string]
  (crypt/encrypt string password))

(defn decrypt [encrypted-blob]
  (crypt/decrypt encrypted-blob password))

