import { useEffect, useState } from "react";
import "../../public/wasm_exec.js";

const useWasm = (workerFile: string) => {
    const [worker, setWorker] = useState<Worker | null>(null);

    const useWorker = <T>(data: any[], callback: (data: T) => void) => {
        if (worker) {
            const promise = new Promise((resolve, reject) => {
                worker.onmessage = (event) => {
                    if (event.data.done) {
                        callback(event.data);
                        resolve(null);
                        return;
                    }
                    if (event.data.error) {
                        reject(event.data.error);
                        return;
                    }
                };
            });
            worker?.postMessage(data);
            return promise;
        }
    };


    useEffect(() => { 
        const _worker = new Worker(workerFile);
        setWorker(_worker);

        _worker.onerror = (e) => {
            console.error(e);
        };

        return () => {
            _worker.terminate();
        };
    }, []);

    return useWorker;
};

export default useWasm;
