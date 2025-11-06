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
        initMobileToc();
    }, 100);

    // 브라우저 탭 제목에서 숫자+점+공백 패턴을 제거 (예: '1. 제목' -> '제목')
    var pageTitle = document.title;
    var newPageTitle = pageTitle.replace(/^\d+\.\s*/, '');
    if (newPageTitle !== pageTitle) {
        document.title = newPageTitle;
    }

    // tag-name, term-name, post-tag에서 숫자+점+공백 패턴을 제거 (예: '1. 제목' -> '제목')
    $('.tag-name, .term-name, .post-tag').each(function() {
        var text = $(this).text();
        var newText = text.replace(/^\d+\.\s*/, '');
        $(this).text(newText);
        // title 속성도 교체
        if (this.hasAttribute('title')) {
            var title = $(this).attr('title');
            var newTitle = title.replace(/^\d+\.\s*/, '');
            $(this).attr('title', newTitle);
        }
    });
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
        return;
    }
    // 기존 내용 제거
    tocContainer.innerHTML = '';
    var headings = document.querySelectorAll('.gh-content h1, .gh-content h2, .gh-content h3, .gh-content h4, .gh-content h5, .gh-content h6');
    if (headings.length < 3) {
        tocContainer.style.display = 'none';
        return;
    }
    // TOC 토글 버튼 생성
    var tocToggle = document.createElement('div');
    tocToggle.className = 'gh-toc-toggle';
    tocToggle.innerHTML = '<span class="gh-toc-toggle-icon">▼</span> 목차';
    tocContainer.appendChild(tocToggle);
    // TOC 구조 생성
    var tocList = document.createElement('ul');
    tocList.className = 'gh-toc-list';
    headings.forEach(function(heading, index) {
        var id = 'heading-' + index;
        heading.id = id;
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.href = '#' + id;
        link.textContent = heading.textContent;
        link.className = 'toc-link';
        // header 레벨별 클래스 추가
        var level = parseInt(heading.tagName.charAt(1));
        link.classList.add('toc-level-' + level);
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    tocContainer.appendChild(tocList);
    // TOC 토글 기능
    tocToggle.addEventListener('click', function() {
        tocContainer.classList.toggle('gh-toc-collapsed');
        // 데스크탑에서만 dimmer 토글
        if (window.innerWidth > 1366) {
            if (!tocContainer.classList.contains('gh-toc-collapsed')) {
                dimmer('open', 'medium');
            } else {
                dimmer('close', 'medium');
            }
        }
    });
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

    if (!headings.length || !tocLinks.length) return;

    function onScroll() {
        var scrollPosition = window.scrollY + 100; // 헤더 등 오프셋
        var activeIndex = 0;
        for (var i = 0; i < headings.length; i++) {
            if (headings[i].offsetTop <= scrollPosition) {
                activeIndex = i;
            }
        }
        tocLinks.forEach(function(link, idx) {
            if (idx === activeIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', onScroll);
    // 페이지 로드시 한 번 실행
    onScroll();
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

// 모바일 TOC 관련 함수
function initMobileToc() {
    if (window.innerWidth > 1366) return;
    var btn = document.querySelector('.mobile-toc-btn');
    var overlay = document.querySelector('.mobile-toc-overlay');
    var list = document.querySelector('.mobile-toc-list');
    var tocContainer = document.querySelector('.gh-toc');
    if (!btn || !overlay || !list || !tocContainer) return;

    // 기존 gh-toc에서 목차 ul만 추출하여 복사
    var tocList = tocContainer.querySelector('.gh-toc-list');
    if (tocList) {
        list.innerHTML = '';
        list.appendChild(tocList.cloneNode(true));
    }

    // 버튼 클릭 시 오버레이 표시
    btn.addEventListener('click', function() {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        dimmer('open', 'medium');
    });
    // 오버레이 바깥 클릭 시 닫기
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            dimmer('close', 'medium');
        }
    });
    // TOC 링크 클릭 시 오버레이 닫기
    list.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            dimmer('close', 'medium');
        }
    });

    // 스크롤 방향 감지하여 버튼 show/hide
    var lastScroll = window.scrollY;
    var ticking = false;
    function onScroll() {
        var curr = window.scrollY;
        if (curr > lastScroll + 10) {
            btn.classList.add('hide');
        } else if (curr < lastScroll - 10) {
            btn.classList.remove('hide');
        }
        lastScroll = curr;
        ticking = false;
    }
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    });
}
