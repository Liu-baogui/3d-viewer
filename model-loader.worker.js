// 模型加载 Web Worker

// 导入必要的库
importScripts('js/three.module.js');
importScripts('js/three/addons/loaders/GLTFLoader.js');
importScripts('js/libs/draco/DRACOLoader.js');
importScripts('js/libs/meshopt/meshopt_decoder.module.js');

self.onmessage = function(e) {
    const { action, modelPath } = e.data;
    
    switch (action) {
        case 'loadModel':
            loadModel(modelPath);
            break;
        default:
            console.error('Unknown action:', action);
    }
};

function loadModel(modelPath) {
    try {
        const loader = new THREE.GLTFLoader();
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('./js/libs/draco/');
        loader.setDRACOLoader(dracoLoader);
        loader.setMeshoptDecoder(MeshoptDecoder);
        
        const isCompressed = /\.gz$/i.test(modelPath);
        
        if (isCompressed) {
            // 处理压缩模型
            const xhr = new XMLHttpRequest();
            xhr.open('GET', modelPath);
            xhr.responseType = 'arraybuffer';
            
            xhr.onprogress = function(e) {
                if (e.lengthComputable && e.total > 0) {
                    const progress = (e.loaded / e.total) * 90;
                    self.postMessage({ 
                        type: 'progress', 
                        progress: progress, 
                        status: '正在下载模型...' 
                    });
                }
            };
            
            xhr.onload = function() {
                if (xhr.status !== 200) {
                    self.postMessage({ 
                        type: 'error', 
                        error: 'HTTP ' + xhr.status 
                    });
                    return;
                }
                
                const compressedBuffer = xhr.response;
                if (!compressedBuffer || compressedBuffer.byteLength === 0) {
                    self.postMessage({ 
                        type: 'error', 
                        error: '空文件' 
                    });
                    return;
                }
                
                self.postMessage({ 
                    type: 'progress', 
                    progress: 92, 
                    status: '正在解压...' 
                });
                
                try {
                    let glbBuffer;
                    const data = new Uint8Array(compressedBuffer);
                    
                    // 尝试使用pako解压
                    if (typeof pako !== 'undefined' && pako.ungzip) {
                        let decompressed = pako.ungzip(data);
                        glbBuffer = decompressed.buffer.slice(decompressed.byteOffset, decompressed.byteOffset + decompressed.byteLength);
                    } else {
                        // 尝试使用原生DecompressionStream
                        const stream = new Blob([compressedBuffer]).stream().pipeThrough(new DecompressionStream('gzip'));
                        new Response(stream).arrayBuffer().then(glbBuffer => {
                            processCompressedModel(glbBuffer);
                        }).catch(error => {
                            self.postMessage({ 
                                type: 'error', 
                                error: '解压失败: ' + error.message 
                            });
                        });
                        return;
                    }
                    
                    processCompressedModel(glbBuffer);
                } catch (err) {
                    self.postMessage({ 
                        type: 'error', 
                        error: '解压失败: ' + err.message 
                    });
                }
            };
            
            xhr.onerror = function() {
                self.postMessage({ 
                    type: 'error', 
                    error: '网络错误' 
                });
            };
            
            xhr.send();
        } else {
            // 处理普通模型
            loader.load(
                modelPath,
                function(gltf) {
                    processModel(gltf);
                },
                function(xhr) {
                    if (xhr.lengthComputable && xhr.total > 0) {
                        const progress = (xhr.loaded / xhr.total) * 100;
                        self.postMessage({ 
                            type: 'progress', 
                            progress: progress, 
                            status: '正在加载模型...' 
                        });
                    }
                },
                function(error) {
                    self.postMessage({ 
                        type: 'error', 
                        error: error.message 
                    });
                }
            );
        }
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            error: error.message 
        });
    }
}

function processCompressedModel(glbBuffer) {
    self.postMessage({ 
        type: 'progress', 
        progress: 98, 
        status: '解析模型...' 
    });
    
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('./js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.setMeshoptDecoder(MeshoptDecoder);
    
    loader.parse(glbBuffer, '', 
        function(gltf) {
            processModel(gltf);
        },
        function(error) {
            self.postMessage({ 
                type: 'error', 
                error: error.message 
            });
        }
    );
}

function processModel(gltf) {
    try {
        self.postMessage({ 
            type: 'progress', 
            progress: 100, 
            status: '处理模型...' 
        });
        
        // 将模型转换为JSON格式，以便传递回主线程
        const modelData = gltf.scene.toJSON();
        
        self.postMessage({ 
            type: 'complete', 
            modelData: modelData 
        });
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            error: error.message 
        });
    }
}