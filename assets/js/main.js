var html = $('html');
var body = $('body');
var timeout;
var st = 0;

$(function () {
    'use strict';
    tagFeed();
    parallax();
    loadMore();
    offCanvas();
    
    // TOC 초기화를 약간 지연시켜 DOM이 완전히 로드된 후 실행
    setTimeout(function() {
        initTableOfContents();
    }, 100);
});

window.addEventListener('scroll', function () {
    'use strict';
    if (document.body.classList.contains('home-template')) {
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(portalButton);
    }
});

function portalButton() {
    'use strict';
    st = window.scrollY;

    if (st > 100) {
        document.body.classList.add('portal-visible');
    } else {
        document.body.classList.remove('portal-visible');
    }
}

function tagFeed() {
    'use strict';
    var count = $('.tag-feed').attr('data-count');

    $('.tag-feed').owlCarousel({
        dots: false,
        nav: true,
        navText: [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor"><path d="M26.667 14.667v2.667h-16l7.333 7.333-1.893 1.893-10.56-10.56 10.56-10.56 1.893 1.893-7.333 7.333h16z"></path></svg>',
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor"><path d="M5.333 14.667v2.667h16l-7.333 7.333 1.893 1.893 10.56-10.56-10.56-10.56-1.893 1.893 7.333 7.333h-16z"></path></svg>',
        ],
        responsive: {
            0: {
                items: 1,
                slideBy: 1
            },
            1024: {
                items: count > 1 ? 2 : count,
                slideBy: count
            },
            1920: {
                items: count > 2 ? 3 : count,
                slideBy: count
            },
            2560: {
                items: count > 3 ? 4 : count,
                slideBy: count
            },
        }
    });
}

function parallax() {
    var image = $('.jarallax-img');
    if (!image) return;

    var options = {
        disableParallax: /iPad|iPhone|iPod|Android/,
        disableVideo: /iPad|iPhone|iPod|Android/,
        speed: 0.1,
    };

    image.imagesLoaded(function () {
        image.parent().jarallax(options).addClass('initialized');
    });
}

function loadMore() {
    'use strict';
    pagination(true);
}

function offCanvas() {
    'use strict';
    var burger = jQuery('.burger');
    var canvasClose = jQuery('.canvas-close');

    burger.on('click', function () {
        html.toggleClass('canvas-opened');
        html.addClass('canvas-visible');
        dimmer('open', 'medium');
    });

    canvasClose.on('click', function () {
        if (html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });

    jQuery('.dimmer').on('click', function () {
        if (html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });

    jQuery(document).keyup(function (e) {
        if (e.keyCode == 27 && html.hasClass('canvas-opened')) {
            html.removeClass('canvas-opened');
            dimmer('close', 'medium');
        }
    });
}

function dimmer(action, speed) {
    'use strict';
    var dimmer = jQuery('.dimmer');

    switch (action) {
        case 'open':
            dimmer.fadeIn(speed);
            break;
        case 'close':
            dimmer.fadeOut(speed);
            break;
    }
}

function initTableOfContents() {
    'use strict';
    
    // Only run on single post pages
    if (!document.querySelector('.single-post')) {
        return;
    }
    
    var tocContainer = document.querySelector('.gh-toc');
    if (!tocContainer) {
        console.log('TOC container not found');
        return;
    }
    
    // 기존 내용 제거
    tocContainer.innerHTML = '';
    
    var headings = document.querySelectorAll('.gh-content h1, .gh-content h2, .gh-content h3, .gh-content h4, .gh-content h5, .gh-content h6');
    
    console.log('Found headings:', headings.length);
    
    if (headings.length < 3) {
        // Hide TOC if there are fewer than 3 headings
        tocContainer.style.display = 'none';
        return;
    }
    
    // Create TOC structure
    var tocTitle = document.createElement('h4');
    tocTitle.className = 'gh-toc-title';
    tocTitle.textContent = '목차';
    
    var tocList = document.createElement('ul');
    tocList.className = 'gh-toc-list';
    
    // Add IDs to headings and create TOC links
    headings.forEach(function(heading, index) {
        var id = 'heading-' + index;
        heading.id = id;
        
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        
        // Add indentation based on heading level
        var level = parseInt(heading.tagName.charAt(1));
        if (level > 2) {
            var subList = tocList.querySelector('ul') || tocList;
            if (!subList.querySelector('ul')) {
                var newSubList = document.createElement('ul');
                subList.appendChild(newSubList);
                subList = newSubList;
            }
        }
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    tocContainer.appendChild(tocTitle);
    tocContainer.appendChild(tocList);
    
    // TOC를 보이게 설정
    tocContainer.style.display = 'block';
    
    // Add scroll spy functionality
    addScrollSpy();
    
    // Add dynamic TOC movement
    addDynamicTocMovement();
}



function addScrollSpy() {
    'use strict';
    
    var headings = document.querySelectorAll('.gh-content h1, .gh-content h2, .gh-content h3, .gh-content h4, .gh-content h5, .gh-content h6');
    var tocLinks = document.querySelectorAll('.gh-toc-list a');
    
    if (!headings.length || !tocLinks.length) {
        return;
    }
    
    var observerOptions = {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            var id = entry.target.id;
            var link = document.querySelector('.gh-toc-list a[href="#' + id + '"]');
            
            if (entry.isIntersecting) {
                // Remove active class from all links
                tocLinks.forEach(function(link) {
                    link.classList.remove('active');
                });
                
                // Add active class to current link
                if (link) {
                    link.classList.add('active');
                }
            }
        });
    }, observerOptions);
    
    headings.forEach(function(heading) {
        observer.observe(heading);
    });
}

function addDynamicTocMovement() {
    'use strict';
    
    var toc = document.querySelector('.gh-toc');
    if (!toc) {
        console.log('TOC element not found for dynamic movement');
        return;
    }
    
    // 모바일에서는 동적 움직임 비활성화
    if (window.innerWidth <= 1024) {
        console.log('Mobile device detected, disabling dynamic TOC movement');
        return;
    }
    
    console.log('Initializing dynamic TOC movement');
    
    var tocTop = 50; // 초기 위치 (vh 단위)
    var minTop = 15; // 최소 위치 (vh 단위)
    var maxTop = 85; // 최대 위치 (vh 단위)
    var isScrolling = false;
    var scrollTimeout;
    
    // 초기 위치 설정
    toc.style.top = tocTop + 'vh';
    
    // 부드러운 애니메이션을 위한 함수
    function smoothMoveToc(targetTop) {
        if (isScrolling) return;
        
        isScrolling = true;
        var startTop = tocTop;
        var distance = targetTop - startTop;
        var duration = 300; // 애니메이션 지속시간 (ms)
        var startTime = performance.now();
        
        function animate(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            
            // easeOutCubic 이징 함수
            progress = 1 - Math.pow(1 - progress, 3);
            
            var currentTop = startTop + (distance * progress);
            toc.style.top = currentTop + 'vh';
            tocTop = currentTop;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isScrolling = false;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // 마우스 휠 이벤트 리스너 (플랫폼에 상관없이 작동)
    window.addEventListener('wheel', function(e) {
        // 스크롤 타임아웃 리셋
        clearTimeout(scrollTimeout);
        
        if (Math.abs(e.deltaY) > 0) {
            // 플랫폼에 상관없이 일관된 방향으로 움직임
            var wheelDelta = e.deltaY * 0.05; // 휠 감도 조정
            var newTop = tocTop - wheelDelta; // 스크롤 방향과 반대로 움직임
            
            // 경계 내에서만 움직임
            newTop = Math.max(minTop, Math.min(maxTop, newTop));
            
            // 부드러운 애니메이션 적용
            smoothMoveToc(newTop);
            
            console.log('Wheel event - deltaY:', e.deltaY, 'newTop:', newTop);
        }
        
        // 스크롤이 멈춘 후 자동으로 중앙으로 돌아가기
        scrollTimeout = setTimeout(function() {
            var centerTop = 50;
            smoothMoveToc(centerTop);
        }, 2000); // 2초 후 중앙으로
    }, { passive: true });
    
    // 키보드 스크롤 이벤트 (Page Up/Down, Arrow keys)
    window.addEventListener('keydown', function(e) {
        if (e.key === 'PageUp' || e.key === 'PageDown' || 
            e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            
            clearTimeout(scrollTimeout);
            
            var keyDelta = 0;
            if (e.key === 'PageUp' || e.key === 'ArrowUp') {
                keyDelta = 5;
            } else if (e.key === 'PageDown' || e.key === 'ArrowDown') {
                keyDelta = -5;
            }
            
            var newTop = tocTop - keyDelta;
            newTop = Math.max(minTop, Math.min(maxTop, newTop));
            
            smoothMoveToc(newTop);
            
            // 키보드 스크롤 후에도 자동 중앙 복귀
            scrollTimeout = setTimeout(function() {
                smoothMoveToc(50);
            }, 2000);
        }
    });
    
    // 윈도우 리사이즈 시 TOC 위치 초기화
    window.addEventListener('resize', function() {
        clearTimeout(scrollTimeout);
        if (window.innerWidth <= 1024) {
            toc.style.top = '50vh';
            tocTop = 50;
        } else {
            smoothMoveToc(50);
        }
    });
    
    // 마우스가 TOC 영역에 있을 때는 자동 중앙 복귀 비활성화
    toc.addEventListener('mouseenter', function() {
        clearTimeout(scrollTimeout);
    });
    
    toc.addEventListener('mouseleave', function() {
        scrollTimeout = setTimeout(function() {
            smoothMoveToc(50);
        }, 1000);
    });
    
    console.log('Dynamic TOC movement initialized successfully');
}
