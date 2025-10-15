document.addEventListener('DOMContentLoaded', function() {
    // Password verification
    const passwordModal = document.getElementById('password-modal');
    const mainContent = document.getElementById('main-content');
    const passwordInput = document.getElementById('password-input');
    const submitPassword = document.getElementById('submit-password');
    const passwordError = document.getElementById('password-error');
    const toast = document.getElementById('toast');
    
    // Correct password
    const correctPassword = '123456';
    
    // Check if password is already verified
    if (sessionStorage.getItem('passwordVerified') === 'true') {
        passwordModal.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }
    
    submitPassword.addEventListener('click', function() {
        if (passwordInput.value === correctPassword) {
            passwordModal.classList.add('hidden');
            mainContent.classList.remove('hidden');
            sessionStorage.setItem('passwordVerified', 'true');
        } else {
            passwordError.textContent = '密码错误，请重试！';
            passwordInput.value = '';
        }
    });
    
    // Allow Enter key to submit password
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitPassword.click();
        }
    });
    
    // Video parsing functionality
    const shareLinkInput = document.getElementById('share-link');
    const parseButton = document.getElementById('parse-button');
    const loadingIndicator = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const videoTitle = document.getElementById('video-title');
    const videoUrl = document.getElementById('video-url');
    const coverUrl = document.getElementById('cover-url');
    const coverPreview = document.getElementById('cover-preview');
    const videoPreview = document.getElementById('video-preview');
    const downloadCover = document.getElementById('download-cover');
    const downloadVideo = document.getElementById('download-video');
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    // API endpoint
    const apiBaseUrl = 'https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk';
    const apiKey = '8a17d3c4c3e54f9b85309cfad182e1b8';
    
    // Copy functionality
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const textElement = document.getElementById(targetId);
            const text = textElement.textContent;
            
            if (text) {
                copyToClipboard(text);
                showToast('已复制到剪贴板');
            }
        });
    });
    
    // Function to copy text to clipboard
    function copyToClipboard(text) {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Execute copy command
            document.execCommand('copy');
        } catch (err) {
            console.error('无法复制内容:', err);
        }
        
        // Clean up
        document.body.removeChild(textarea);
    }
    
    // Function to show toast message
    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 2000);
    }
    
    parseButton.addEventListener('click', async function() {
        const shareText = shareLinkInput.value.trim();
        
        if (!shareText) {
            alert('请粘贴分享链接！');
            return;
        }
        
        // Extract URL using regex
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = shareText.match(urlRegex);
        
        if (!matches || matches.length === 0) {
            alert('未找到有效的链接，请检查分享内容！');
            return;
        }
        
        const extractedUrl = matches[0];
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        parseButton.disabled = true;
        
        try {
            // Call API to parse video
            const apiUrl = `${apiBaseUrl}?ak=${apiKey}&link=${encodeURIComponent(extractedUrl)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            parseButton.disabled = false;
            
            if (data.code === '10000' && data.content && data.content.success) {
                // Show result section
                resultSection.classList.remove('hidden');
                
                // Display video information
                const title = data.content.title || '未知标题';
                const coverLink = data.content.cover || '';
                const videoLink = data.content.url || '';
                
                videoTitle.textContent = title;
                videoUrl.textContent = videoLink;
                coverUrl.textContent = coverLink;
                
                // Set cover preview
                if (coverLink) {
                    coverPreview.src = coverLink;
                    downloadCover.disabled = false;
                } else {
                    coverPreview.src = '';
                    downloadCover.disabled = true;
                }
                
                // Set video preview
                if (videoLink) {
                    videoPreview.src = videoLink;
                    downloadVideo.disabled = false;
                } else {
                    videoPreview.src = '';
                    downloadVideo.disabled = true;
                }
                
                // Store URLs for download
                downloadCover.setAttribute('data-url', coverLink);
                downloadVideo.setAttribute('data-url', videoLink);
                
                // Scroll to result section
                resultSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert('解析失败，请检查链接是否有效！');
            }
        } catch (error) {
            console.error('Error parsing video:', error);
            alert('解析过程中出错，请稍后重试！');
            loadingIndicator.classList.add('hidden');
            parseButton.disabled = false;
        }
    });
    
    // Download functionality
    downloadCover.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (url) {
            downloadResource(url, '封面.jpg');
        }
    });
    
    downloadVideo.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (url) {
            downloadResource(url, '视频.mp4');
        }
    });
    
    // Function to download resources
    function downloadResource(url, filename) {
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        // Add to document, click it, and remove it
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    }
});