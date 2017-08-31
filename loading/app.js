var intro = (function() {

			function hasWebGL() {
				//return false;
				try {
					return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
				} catch (e) {
					return false;
				}
			}

			/*INTRO */
			window.scrollTo(0, 0);

			if (window.innerWidth < 1025)
				window.isMobile = true;

			if (!hasWebGL())
				window.noWebgl = true;

			var keyframeCount = 30;
			var currKeyframe = 0;

			var lines = document.querySelectorAll('.intro-ring');
			var totalLength = lines[0].getTotalLength();

			var timer = setInterval(function() {
					if (currKeyframe == keyframeCount)
						clearInterval(timer);

					lines[1].style.strokeDasharray = lines[0].style.strokeDasharray = (currKeyframe++/keyframeCount*totalLength)+'px, ' + totalLength+ 'px';

					}, 16)

				setTimeout(function() {
					updateProgress();
				}, 800);
				var pathLength = 440;
				var circleSvg = document.getElementById('loading-circle');
					var totalRatio = 0;
				function updateProgress() {
					if (totalRatio <= 100) {
						var currLength = pathLength - pathLength * totalRatio / 100;
						circleSvg.style.strokeDasharray = pathLength + 'px, ' + currLength + 'px'
						totalRatio++;
						setTimeout(function() {
							updateProgress();
						}, 20);
					} else {
						return ;
					}
				}
			})();