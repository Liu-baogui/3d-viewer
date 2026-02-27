// 模型加载 Web Worker

// 模拟模型加载和处理过程
self.onmessage = function(e) {
    const { action, modelPath, modelData } = e.data;
    
    switch (action) {
        case 'loadModel':
            loadModel(modelPath);
            break;
        case 'processModel':
            processModel(modelData);
            break;
        default:
            console.error('Unknown action:', action);
    }
};

function loadModel(modelPath) {
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
            self.postMessage({ 
                type: 'complete', 
                modelPath: modelPath 
            });
        }
    }, 100);
}

function processModel(modelData) {
    // 模拟模型处理过程
    let progress = 0;
    const totalSteps = 100;
    
    const interval = setInterval(() => {
        progress += 10;
        
        self.postMessage({ 
            type: 'progress', 
            progress: progress, 
            status: '正在处理模型...' 
        });
        
        if (progress >= 100) {
            clearInterval(interval);
            self.postMessage({ 
                type: 'complete', 
                processed: true 
            });
        }
    }, 50);
}