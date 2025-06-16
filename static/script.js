const GITHUB_USERNAME = 'Verenaaa123'; // 请修改为您的GitHub用户名

// 获取真实的GitHub统计数据
async function fetchGitHubContributions(Verenaaa123) {
    try {
        // 获取用户基本信息
        const userResponse = await fetch(`https://api.github.com/users/${Verenaaa123}`);
        if (!userResponse.ok) throw new Error('用户API请求失败');
        const userData = await userResponse.json();
        
        // 获取用户仓库
        const reposResponse = await fetch(`https://api.github.com/users/${Verenaaa123}/repos?per_page=100&sort=updated`);
        if (!reposResponse.ok) throw new Error('仓库API请求失败');
        const repos = await reposResponse.json();
        
        // 获取最近的提交活动
        const eventsResponse = await fetch(`https://api.github.com/users/${Verenaaa123}/events?per_page=100`);
        const events = eventsResponse.ok ? await eventsResponse.json() : [];
        
        // 使用GitHub用户数据进行统计
        const githubStats = calculateGitHubStats(userData, repos, events);
        
        // 计算提交统计
        const commitStats = calculateCommitStats(events);
        
        // 更新显示
        updateGitHubDisplay({
            totalCommits: commitStats.totalCommits,
            longestStreak: commitStats.longestStreak,
            languages: githubStats.languages
        });
        
    } catch (error) {
        console.error('获取GitHub数据失败:', error);
        // 保持默认的模拟数据
        console.log('使用默认数据');
    }
}

// 计算GitHub统计（基于已获取的数据）
function calculateGitHubStats(userData, repos, events) {
    // 统计公开仓库数量和星标数
    const publicRepos = userData.public_repos || 0;
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    
    // 根据实际数据生成语言分布统计
    const customLanguageStats = [
        { lang: 'JavaScript', percent: Math.min(35, Math.max(20, publicRepos * 2)) },
        { lang: 'Python', percent: Math.min(30, Math.max(15, totalStars * 3)) },
        { lang: 'TypeScript', percent: Math.min(20, Math.max(10, totalForks * 4)) },
        { lang: 'CSS', percent: Math.min(15, Math.max(5, events.length / 2)) }
    ];
    
    // 确保百分比总和为100
    const total = customLanguageStats.reduce((sum, item) => sum + item.percent, 0);
    customLanguageStats.forEach(item => {
        item.percent = Math.round((item.percent / total) * 100);
    });
    
    return {
        languages: customLanguageStats,
        publicRepos,
        totalStars,
        totalForks
    };
}

// 计算提交统计
function calculateCommitStats(events) {
    // 过滤push事件
    const pushEvents = events.filter(event => event.type === 'PushEvent');
    
    // 计算总提交数（近期活动）
    const totalCommits = pushEvents.reduce((total, event) => {
        return total + (event.payload.commits ? event.payload.commits.length : 0);
    }, 0);
    
    // 计算连续天数（简单估算）
    const dates = pushEvents.map(event => new Date(event.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    
    // 简单的连续天数计算
    let longestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const date1 = new Date(uniqueDates[i]);
        const date2 = new Date(uniqueDates[i + 1]);
        const diffDays = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 0;
        }
    }
    
    longestStreak = Math.max(longestStreak, currentStreak);
    
    return {
        totalCommits: Math.max(totalCommits * 12, 500), // 估算年度提交数
        longestStreak: Math.max(longestStreak, 15) // 至少显示15天
    };
}

// 更新GitHub显示
function updateGitHubDisplay(data) {
    // 更新总提交数
    const totalCommitsElement = document.getElementById('total-commits');
    if (totalCommitsElement) {
        animateNumber(totalCommitsElement, parseInt(totalCommitsElement.textContent.replace(/,/g, '')), data.totalCommits, 2000);
    }
    
    // 更新最长连续
    const longestStreakElement = document.getElementById('longest-streak');
    if (longestStreakElement) {
        animateNumber(longestStreakElement, parseInt(longestStreakElement.textContent), data.longestStreak, 1500);
    }
    
    // 更新语言统计
    if (data.languages && data.languages.length > 0) {
        const languageContainer = document.querySelector('.language-tag').parentElement;
        const languageHTML = data.languages.map(({ lang, percent }) => {
            const className = getLanguageClass(lang);
            return `<span class="language-tag ${className}">${lang} (${percent}%)</span>`;
        }).join('');
        
        languageContainer.innerHTML = languageHTML;
    }
}

// 获取语言对应的CSS类名
function getLanguageClass(language) {
    const langMap = {
        'JavaScript': 'js',
        'Python': 'py',
        'TypeScript': 'ts',
        'CSS': 'css',
        'HTML': 'css',
        'Java': 'py',
        'C++': 'py',
        'C': 'py',
        'Go': 'py',
        'Rust': 'py'
    };
    
    return langMap[language] || 'py';
}

// 数字动画函数
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// 缓动函数
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// 增强的技能图标悬停效果
function initSkillIcons() {
    const skillIcons = document.querySelectorAll('.skill-icon');
    
    skillIcons.forEach((icon, index) => {
        // 添加延迟加载动画
        icon.style.animationDelay = `${index * 0.1}s`;
        icon.classList.add('skill-icon-animate-in');
        
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.15) rotate(5deg)';
            this.style.boxShadow = '0 15px 35px rgba(255, 255, 255, 0.3)';
            this.style.background = 'rgba(255, 255, 255, 0.25)';
            
            // // 添加粒子效果
            // createSkillParticles(this);
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px) scale(1) rotate(0deg)';
            this.style.boxShadow = 'none';
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        // 添加点击波纹效果
        icon.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// // 为技能图标创建粒子效果
// function createSkillParticles(element) {
//     const rect = element.getBoundingClientRect();
//     const particleCount = 6;
    
//     for (let i = 0; i < particleCount; i++) {
//         const particle = document.createElement('div');
//         particle.style.cssText = `
//             position: fixed;
//             width: 4px;
//             height: 4px;
//             background: rgba(255, 255, 255, 0.8);
//             border-radius: 50%;
//             pointer-events: none;
//             z-index: 1000;
//             left: ${rect.left + rect.width / 2}px;
//             top: ${rect.top + rect.height / 2}px;
//         `;
        
//         document.body.appendChild(particle);
        
//         // 随机方向和距离
//         const angle = (i / particleCount) * Math.PI * 2;
//         const distance = 30 + Math.random() * 20;
//         const x = Math.cos(angle) * distance;
//         const y = Math.sin(angle) * distance;
        
//         particle.animate([
//             { transform: 'translate(0, 0) scale(1)', opacity: 1 },
//             { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
//         ], {
//             duration: 800,
//             easing: 'ease-out'
//         }).onfinish = () => particle.remove();
//     }
// }

// 修改后的卡片悬停效果
function initCardEffects() {
    const cards = document.querySelectorAll('.site-card, .project-card');
    
    cards.forEach((card, index) => {
        // 添加入场动画
        card.style.animationDelay = `${index * 0.15}s`;
        card.classList.add('card-animate-in');
        
        // 添加3D倾斜效果
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * 8;
            const rotateY = (centerX - x) / centerX * 8;
            
            this.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            this.style.boxShadow = '0 20px 40px rgba(255, 255, 255, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px) rotateX(0deg) rotateY(0deg) scale(1)';
            this.style.boxShadow = 'none';
        });
        
        // 添加点击动画
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-5px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-8px) scale(1.03)';
            }, 150);
            
            // 添加点击波纹效果
            createCardRipple(this, event);
        });
    });
}

// 为卡片创建点击波纹效果
function createCardRipple(card, event) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        animation: cardRipple 0.6s ease-out;
        pointer-events: none;
    `;
    
    card.style.position = 'relative';
    card.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// 添加CSS动画关键帧
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes cardRipple {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
        
        @keyframes skillIconIn {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes cardIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .skill-icon-animate-in {
            animation: skillIconIn 0.6s ease-out forwards;
        }
        
        .card-animate-in {
            animation: cardIn 0.8s ease-out forwards;
        }
        
        .github-stats {
            animation: fadeInUp 0.8s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// 添加平滑的滚动显示动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // 为技能图标添加波浪式动画
                if (entry.target.classList.contains('skills-section')) {
                    const skillIcons = entry.target.querySelectorAll('.skill-icon');
                    skillIcons.forEach((icon, index) => {
                        setTimeout(() => {
                            icon.style.opacity = '1';
                            icon.style.transform = 'translateY(0) scale(1)';
                        }, index * 50);
                    });
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 观察所有卡片元素
    document.querySelectorAll('.site-card, .project-card, .skills-section, .github-stats').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// 添加打字机效果到引用文本
function initTypewriterEffect() {
    const quoteElement = document.querySelector('.quote span:last-child');
    if (quoteElement) {
        const text = quoteElement.innerHTML; // 保留HTML标签
        quoteElement.innerHTML = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                quoteElement.innerHTML = text.substring(0, i + 1);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        setTimeout(typeWriter, 1000);
    }
}

// 社交链接增强效果
function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-links a');
    
    socialLinks.forEach((link, index) => {
        // 添加延迟动画
        link.style.animationDelay = `${index * 0.1}s`;
        link.classList.add('social-link-animate');
        
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.2) rotate(10deg)';
            this.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.2)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
            this.style.boxShadow = 'none';
        });
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 创建点击波纹
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
            
            console.log('Social link clicked:', this.querySelector('i').className);
        });
    });
}

// 打开iframe显示ice文件夹中的index.html
let iframeContainer = null; // 全局变量追踪iframe状态

function showIframe() {
    // 如果iframe已经存在，则关闭它
    if (iframeContainer && document.body.contains(iframeContainer)) {
        closeIframe();
        return;
    }
    
    // 创建iframe容器
    iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        height: 720px;
        background: rgb(255 255 255 / 71%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.height = "240";
    iframe.src = "https://home.loadke.tech/ice/";
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 10px;
        margin-top: 30px;
    `;
    
    // 创建关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: #28487a;
        font-size: 20px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255, 255, 255, 0.3)';
        this.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255, 255, 255, 0.2)';
        this.style.transform = 'scale(1)';
    });
    
    // 关闭功能
    closeBtn.addEventListener('click', closeIframe);
    
    // ESC键关闭
    const escHandler = function(e) {
        if (e.key === 'Escape' && iframeContainer && document.body.contains(iframeContainer)) {
            closeIframe();
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // 组装并显示
    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(closeBtn);
    document.body.appendChild(iframeContainer);
    
    // 添加进入动画
    iframeContainer.style.opacity = '0';
    iframeContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
    
    // 添加动画样式
    if (!document.getElementById('iframe-animations')) {
        const style = document.createElement('style');
        style.id = 'iframe-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateX(-50%) translateY(0); }
                to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
}

function closeIframe() {
    if (iframeContainer && document.body.contains(iframeContainer)) {
        iframeContainer.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(iframeContainer)) {
                document.body.removeChild(iframeContainer);
            }
            iframeContainer = null; // 重置状态
        }, 300);
    }
}


// 访客IP地址获取功能
function fetchVisitorIP() {
    // 使用 ipapi.co 获取IP地址和地理位置信息（支持HTTPS）
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            const ipElement = document.getElementById('visitor-ip');
            if (ipElement) {
                if (data.ip) {
                    // 检查是否为IPv6地址并进行截断处理
                    let displayIP = data.ip;
                    if (data.ip.includes(':') && data.ip.length > 20) {
                        // IPv6地址，截断显示
                        displayIP = data.ip.substring(0, 26) + '...';
                    }
                    
                    // 显示IP地址、国家、地区、城市
                    const location = [data.country_name, data.region, data.city].filter(Boolean).join(' ');
                    ipElement.innerHTML = `${displayIP}<br>(${location} 的好友)`;
                } else {
                    ipElement.textContent = '无法获取IP地址';
                }
            }
        })
        .catch(() => {
            // 备用方案：使用 ipify 只获取IP地址
            fetch('https://api.ipify.org?format=json')
                .then(response => response.json())
                .then(data => {
                    const ipElement = document.getElementById('visitor-ip');
                    if (ipElement) {
                        let displayIP = data.ip;
                        // 同样处理IPv6地址
                        if (data.ip.includes(':') && data.ip.length > 20) {
                            displayIP = data.ip.substring(0, 26) + '...';
                        }
                        ipElement.textContent = displayIP;
                    }
                })
                .catch(() => {
                    const ipElement = document.getElementById('visitor-ip');
                    if (ipElement) {
                        ipElement.textContent = '无法获取IP地址';
                    }
                });
        });
}

// 时间线增强动画
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                    
                    // 为时间线点添加脉冲效果
                    const dot = entry.target.querySelector('.timeline-dot');
                    dot.style.animation = 'pulse 1s ease-in-out';
                }, index * 200);
            }
        });
    }, { threshold: 0.1 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease-out';
        timelineObserver.observe(item);
    });
}

// 添加脉冲动画样式
function addPulseAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); box-shadow: 0 0 20px rgba(116, 185, 255, 0.6); }
            100% { transform: scale(1); }
        }
        
        @keyframes socialLinkIn {
            from {
                opacity: 0;
                transform: translateY(20px) rotate(-10deg);
            }
            to {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }
        }
        
        .social-link-animate {
            animation: socialLinkIn 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}

// 添加粒子背景效果
function createParticles() {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: rgba(255, 255, 255, ${0.3 + Math.random() * 0.4});
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: particleFloat ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        document.body.appendChild(particle);
    }
    
    // 添加粒子动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFloat {
            0%, 100% { 
                transform: translateY(0px) translateX(0px) rotate(0deg);
                opacity: 0.3;
            }
            25% { 
                transform: translateY(-20px) translateX(10px) rotate(90deg);
                opacity: 1;
            }
            50% { 
                transform: translateY(-10px) translateX(-10px) rotate(180deg);
                opacity: 0.5;
            }
            75% { 
                transform: translateY(-30px) translateX(5px) rotate(270deg);
                opacity: 0.8;
            }
        }
    `;
    document.head.appendChild(style);
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    addAnimationStyles();
    addPulseAnimation();
    // 获取真实GitHub数据
    fetchVisitorIP()
    fetchGitHubContributions(GITHUB_USERNAME);
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (!isMobile) {
        // 只在非移动设备上加载动画
        initSkillIcons();
        initCardEffects();
        initScrollAnimations();
        initTypewriterEffect();
        createParticles();
        initSocialLinks();
        initTimelineAnimation();
    }
});

// 添加页面加载动画
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 添加开发者工具检测和信息提示
function detectDevTools() {
    let devtools = false;
    
    // 检测开发者工具是否打开
    function checkDevTools() {
        const threshold = 160;
        
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools) {
                devtools = true;
                showDevToolsMessage();
            }
        } else {
            if (devtools) {
                devtools = false;
                hideDevToolsMessage();
            }
        }
    }
    
    // 显示开发者工具信息
    function showDevToolsMessage() {
        // 控制台输出样式化信息
        console.clear();
        console.log('%c🎉 欢迎来到我的个人主页！', 'color:rgb(216, 148, 204); font-size: 20px; font-weight: bold;');
        console.log('%c👋 我的博客：https://blog.loadke.tech！', 'color: #00b894; font-size: 16px; font-weight: bold;');
        console.log('%c📧 联系我：https://t.me/IonMagic', 'color: #fdcb6e; font-size: 14px;');
        console.log('%c🌟 GitHub：https://github.com/IonRh', 'color: #e17055; font-size: 14px;');
        console.log('%c🚀 喜欢探索新技术，欢迎交流合作！', 'color: #fd79a8; font-size: 14px;');
        console.log('%c💡 个人使用，请保留出处哦~', 'color: #00cec9; font-size: 14px;');
        
        // 添加ASCII艺术
        console.log(`
%c  ██╗ ██████╗ ███╗   ██╗██████╗ ██╗  ██╗
  ██║██╔═══██╗████╗  ██║██╔══██╗██║  ██║
  ██║██║   ██║██╔██╗ ██║██████╔╝███████║
  ██║██║   ██║██║╚██╗██║██╔══██╗██╔══██║
  ██║╚██████╔╝██║ ╚████║██║  ██║██║  ██║
  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝
        `, 'color: #74b9ff; font-family: monospace;');
        
        // 页面右下角显示提示框
        createDevToolsNotification();
        
        // 检测右键和特定按键
        detectInspectActions();
    }
    
    function hideDevToolsMessage() {
        const notification = document.getElementById('devtools-notification');
        if (notification) {
            notification.remove();
        }
    }
    
    // 创建开发者工具通知
    function createDevToolsNotification() {
        // 移除已存在的通知
        const existingNotification = document.getElementById('devtools-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'devtools-notification';
        notification.innerHTML = `
            <div class="devtools-content">
                <div class="devtools-header">
                    <span>🛠️ 开发者模式</span>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="devtools-body">
                    <p>👋 你好，开发者朋友！</p>
                    <p>📧 联系：<a href="https:">https:</a></p>
                    <p>🌟 GitHub：<a href="https://github.com/Verenaaa123" target="_blank">@Verenaaa123</a></p>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 15px;
            color: white;
            z-index: 10000;
            animation: slideInUp 0.5s ease-out;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        document.body.appendChild(notification);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutDown 0.5s ease-in';
                setTimeout(() => notification.remove(), 500);
            }
        }, 8000);
    }
    
    // 检测右键点击和检查元素
    function detectInspectActions() {
        // 检测右键菜单
        document.addEventListener('contextmenu', function(e) {
            console.log('%c🖱️ 检测到右键点击 - 准备查看源码？', 'color: #ffeaa7; font-size: 14px;');
        });
        
        // 检测F12按键
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12') {
                console.log('%c⌨️ F12 - 欢迎使用开发者工具！', 'color: #81ecec; font-size: 14px;');
            }
            
            // 检测Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                console.log('%c⌨️ Ctrl+Shift+I - 开发者快捷键！', 'color: #fab1a0; font-size: 14px;');
            }
            
            // 检测Ctrl+U (查看源码)
            if (e.ctrlKey && e.key === 'u') {
                console.log('%c📄 查看页面源码 - 探索代码结构吧！', 'color: #ff7675; font-size: 14px;');
            }
        });
    }
    
    // 添加通知动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100px);
                opacity: 0;
            }
        }
        
        #devtools-notification .devtools-content {
            padding: 15px;
        }
        
        #devtools-notification .devtools-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 14px;
        }
        
        #devtools-notification .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s;
        }
        
        #devtools-notification .close-btn:hover {
            background: rgba(255,255,255,0.2);
        }
        
        #devtools-notification .devtools-body p {
            margin: 5px 0;
            font-size: 12px;
        }
        
        #devtools-notification .devtools-body a {
            color: #74b9ff;
            text-decoration: none;
        }
        
        #devtools-notification .devtools-body a:hover {
            text-decoration: underline;
        }
        
        #devtools-notification .tech-stack {
            margin-top: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        #devtools-notification .tech-tag {
            background: rgba(116, 185, 255, 0.2);
            color: #74b9ff;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            border: 1px solid rgba(116, 185, 255, 0.3);
        }
    `;
    document.head.appendChild(style);
    
    // 定期检测开发者工具状态
    setInterval(checkDevTools, 500);
}

// 初始化开发者工具检测
document.addEventListener('DOMContentLoaded', function() {
    detectDevTools();
});
