// 模型加载 Web Worker

// 注意：Web Worker中不能直接使用ES模块语法
// 我们需要使用不同的方式来处理模型加载

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
        // 模拟模型加载过程，因为Web Worker中无法直接加载Three.js
        let progress = 0;
        const totalSteps = 100;
        
        const interval = setInterval(() => {
            progress += 5;
            
            // 模拟不同阶段的加载
            let status = '加载中...';
            if (progress < 30) {
                status = '正在下载模型...';
            } else if (progress < 60) {
                status = '正在解析模型...';
            } else if (progress < 90) {
                status = '正在处理材质...';
            } else {
                status = '正在初始化场景...';
            }
            
            self.postMessage({ 
                type: 'progress', 
                progress: progress, 
                status: status 
            });
            
            if (progress >= 100) {
                clearInterval(interval);
                // 完成后通知主线程使用本地加载
                self.postMessage({ 
                    type: 'complete', 
                    modelPath: modelPath 
                });
            }
        }, 100);
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            error: error.message 
        });
    }
}