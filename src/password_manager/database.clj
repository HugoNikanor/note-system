(ns password-manager.database
  ;(:require [clojure.java.jdbc :as sql]
  )

; select * from passwords 
; where service=service and 
;       accoutn=account and
;       not replaced

(defn db-get [service account]
  [{:service "Reddit"
    :username "HugoNikanor"
    :email "hugo.hornquist@gmail.com"
    :note ""
    :date-set "2016-06-14"
    :password "RedditPassword"}
   {:service "Reddit"
    :username "Parenthesis-bot"
    :date-set "2016-06-14"
    :password "BotPassword"}])
