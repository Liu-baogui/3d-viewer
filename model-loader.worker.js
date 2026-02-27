// 模型加载 Web Worker

// 注意：Web Worker中不能使用ES模块语法，也不能直接加载Three.js
// 我们使用模拟加载过程来提供更好的用户体验

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
        // 模拟模型加载过程
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