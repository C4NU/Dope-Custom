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
    var container = document.querySelector('.post-content.gh-content.gh-canvas');
    if (!toc || !container) return;
    if (window.innerWidth <= 1024) return;

    var tocHeight = toc.offsetHeight;
    var containerRect = container.getBoundingClientRect();
    var minTop = containerRect.top + window.scrollY + 20; // 본문 상단 + 여백
    var maxTop = containerRect.bottom + window.scrollY - tocHeight - 20; // 본문 하단 - TOC 높이 - 여백

    function updateTocPosition(scrollY) {
        // 화면 중간에 위치시키고 싶으면 아래처럼
        var desiredTop = scrollY + window.innerHeight / 2 - tocHeight / 2;
        // clamp
        var newTop = Math.max(minTop, Math.min(maxTop, desiredTop));
        toc.style.position = 'fixed';
        toc.style.top = (newTop - scrollY) + 'px';
        toc.style.left = '20px';
        toc.style.right = '';
    }

    window.addEventListener('scroll', function() {
        updateTocPosition(window.scrollY);
    });

    window.addEventListener('resize', function() {
        tocHeight = toc.offsetHeight;
        containerRect = container.getBoundingClientRect();
        minTop = containerRect.top + window.scrollY + 20;
        maxTop = containerRect.bottom + window.scrollY - tocHeight - 20;
        updateTocPosition(window.scrollY);
    });

    // 초기 위치
    updateTocPosition(window.scrollY);
}
