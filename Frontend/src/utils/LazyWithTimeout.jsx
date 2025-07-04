import { lazy } from "react"

export const LazyWithTimeout = (importFunc, timeout = 10000) => {
    return lazy(()=>
        Promise.race([
            importFunc(),
            new Promise((_,reject) =>
                setTimeout(()=>reject(new Error("Timeout while loading component")),timeout)
            )
        ])
    );
};