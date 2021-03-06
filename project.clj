(defproject note-server "1.0"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :min-lein-version "2.0.0"
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [compojure "1.4.0"]
                 [ring/ring-defaults "0.1.5"]
                 [hiccup "1.0.5"] ; html handling
                 [org.clojure/java.jdbc "0.6.1"]
                 [mysql/mysql-connector-java "5.1.25"]
                 [org.clojars.tnoda/simple-crypto "0.1.0"]
                 [org.clojure/data.json "0.2.6"]
                 ]
  :plugins [[lein-ring "0.9.7"]]
  :ring {:handler noteServer.handler/app}
  :profiles
  {:dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring/ring-mock "0.3.0"]]}})
