(ns other.call)

(defn call [^String nm & args]
  (when-let [fun (ns-resolve *ns* (symbol nm))]
    (apply fun args)))
