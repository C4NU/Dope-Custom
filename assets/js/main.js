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

    // 브라우저 탭(문서 title)에서 숫자+점+공백 패턴 제거
    if (document.title) {
        document.title = document.title.replace(/^\d+\.\s*/, '');
    }

    // tag-name에서 숫자+점+공백 패턴을 제거 (예: '1. 제목' -> '제목')
    $('.tag-name, .term-name').each(function() {
        var text = $(this).text();
        var newText = text.replace(/^\d+\.\s*/, '');
        $(this).text(newText);
    });

    // 게시글 내 .post-tag의 텍스트와 title에서 숫자+점+공백 패턴 제거
    $('.post-tag').each(function() {
        var text = $(this).text();
        var newText = text.replace(/^\d+\.\s*/, '');
        $(this).text(newText);
        var title = $(this).attr('title');
        if (title) {
            var newTitle = title.replace(/^\d+\.\s*/, '');
            $(this).attr('title', newTitle);
        }
    });

    // chip UI를 public tag(공개 태그) 페이지에서만 보이게 하고,
    // 해당 페이지의 게시글에 실제로 존재하는 internal tag만 chip으로 보여주기
    if (document.body.classList.contains('tag-template')) {
        // tag 페이지에서만 동작
        (async function() {
            const apiKey = '82b43c471ed5ad2a555dd38f3d';
            const apiUrl = window.location.origin;
            try {
                // 1. 현재 페이지의 게시글에서 internal tag만 추출
                // 모든 게시글의 태그를 수집
                const postTags = [];
                document.querySelectorAll('.post-feed [class*="post"]').forEach(post => {
                    // 각 포스트의 태그 링크를 모두 수집
                    post.querySelectorAll('.post-tag').forEach(tagEl => {
                        const tagName = tagEl.textContent.trim();
                        if (tagName.startsWith('#')) {
                            postTags.push(tagName.replace(/^#/, ''));
                        }
                    });
                });
                // 중복 제거
                const uniqueInternalTags = [...new Set(postTags)];
                if (uniqueInternalTags.length === 0) {
                    $('.internal-tags-chips').hide();
                    return;
                }
                // 2. internal 태그 정보(슬러그 등)를 API로 가져와서 매칭
                const res = await fetch(`${apiUrl}/ghost/api/content/tags/?filter=visibility:internal&limit=all&key=${apiKey}`);
                const data = await res.json();
                if (data.tags && data.tags.length > 0) {
                    // 현재 페이지 게시글에 실제로 존재하는 internal tag만 chip으로 생성
                    const chips = data.tags
                        .filter(tag => uniqueInternalTags.includes(tag.name.replace(/^#/, '')))
                        .map(tag => {
                            const cleanName = tag.name.replace(/^#/, '');
                            const cleanSlug = tag.slug.replace(/^#/, '');
                            return `<a class="chip" href="/tag/${cleanSlug}/">#${cleanName}</a>`;
                        }).join('');
                    if (chips) {
                        $('.internal-tags-chips').html(chips).show();
                    } else {
                        $('.internal-tags-chips').hide();
                    }
                } else {
                    $('.internal-tags-chips').hide();
                }
            } catch (e) {
                $('.internal-tags-chips').hide();
            }
        })();
    } else {
        // tag 페이지가 아니면 chip UI 숨김
        $('.internal-tags-chips').hide();
    }
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
