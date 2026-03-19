(function () {
  const storageKey = 'garden-manager-garden-plan-v1';
  const svg = document.getElementById('garden-plan-canvas');

  if (!svg) {
    return;
  }

  const markerTypes = JSON.parse(document.getElementById('garden-plan-marker-types').textContent);
  const shapeElement = document.getElementById('garden-shape');
  const outlineElement = document.getElementById('garden-outline');
  const pointsElement = document.getElementById('garden-points');
  const markersElement = document.getElementById('garden-markers');
  const statusElement = document.getElementById('plan-status');
  const markerTypeElement = document.getElementById('marker-type');
  const markerLabelElement = document.getElementById('marker-label');
  const markerSummaryElement = document.getElementById('marker-summary');
  const markerListElement = document.getElementById('marker-list');
  const modeButtons = Array.from(document.querySelectorAll('[data-plan-mode]'));
  const actionButtons = Array.from(document.querySelectorAll('[data-plan-action]'));
  const markerTypeMap = new Map(markerTypes.map((markerType) => [markerType.value, markerType]));

  const state = loadState();
  let dragMarkerId = null;

  setMode(state.mode || 'outline');
  syncLabelPlaceholder();
  render();

  svg.addEventListener('click', (event) => {
    if (dragMarkerId) {
      return;
    }

    const point = getSvgPoint(event);

    if (state.mode === 'outline') {
      if (state.isClosed) {
        setStatus('The outline is already closed. Reset the plan to redraw it.');
        return;
      }

      state.points.push(point);
      persist();
      render();
      return;
    }

    if (!state.isClosed) {
      setStatus('Close the garden shape before placing markers.');
      return;
    }

    if (!isPointInPolygon(point, state.points)) {
      setStatus('Place markers inside the garden outline.');
      return;
    }

    addMarker(point);
  });

  svg.addEventListener('pointermove', (event) => {
    if (!dragMarkerId) {
      return;
    }

    const point = getSvgPoint(event);
    if (!isPointInPolygon(point, state.points)) {
      return;
    }

    const marker = state.markers.find((entry) => entry.id === dragMarkerId);
    if (!marker) {
      return;
    }

    marker.x = point.x;
    marker.y = point.y;
    persist();
    render();
  });

  svg.addEventListener('pointerup', () => {
    dragMarkerId = null;
  });

  svg.addEventListener('pointerleave', () => {
    dragMarkerId = null;
  });

  markersElement.addEventListener('pointerdown', (event) => {
    const markerGroup = event.target.closest('[data-marker-id]');
    if (!markerGroup) {
      return;
    }

    dragMarkerId = markerGroup.getAttribute('data-marker-id');
    svg.setPointerCapture(event.pointerId);
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setMode(button.getAttribute('data-plan-mode'));
      render();
    });
  });

  actionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-plan-action');

      if (action === 'close-shape') {
        closeShape();
        return;
      }

      if (action === 'undo-point') {
        undoPoint();
        return;
      }

      if (action === 'reset-plan') {
        resetPlan();
      }
    });
  });

  markerTypeElement.addEventListener('change', syncLabelPlaceholder);

  markerListElement.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-marker-id]');
    if (!removeButton) {
      return;
    }

    const markerId = removeButton.getAttribute('data-remove-marker-id');
    state.markers = state.markers.filter((marker) => marker.id !== markerId);
    persist();
    render();
  });

  function loadState() {
    try {
      const savedValue = window.localStorage.getItem(storageKey);
      if (!savedValue) {
        return {
          mode: 'outline',
          points: [],
          isClosed: false,
          markers: []
        };
      }

      const parsedValue = JSON.parse(savedValue);
      return {
        mode: parsedValue.mode || 'outline',
        points: Array.isArray(parsedValue.points) ? parsedValue.points : [],
        isClosed: Boolean(parsedValue.isClosed),
        markers: Array.isArray(parsedValue.markers) ? parsedValue.markers : []
      };
    } catch (error) {
      return {
        mode: 'outline',
        points: [],
        isClosed: false,
        markers: []
      };
    }
  }

  function persist() {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function render() {
    const pointsValue = state.points.map((point) => `${point.x},${point.y}`).join(' ');
    shapeElement.setAttribute('points', state.isClosed ? pointsValue : '');
    outlineElement.setAttribute('points', pointsValue);

    pointsElement.innerHTML = state.points
      .map((point, index) => `<circle class="garden-plan-point" cx="${point.x}" cy="${point.y}" r="7"><title>Outline point ${index + 1}</title></circle>`)
      .join('');

    markersElement.innerHTML = state.markers
      .map((marker) => {
        const markerType = markerTypeMap.get(marker.type) || markerTypes[0];
        const safeLabel = escapeHtml(marker.label);
        return `
          <g class="garden-plan-marker" data-marker-id="${marker.id}" transform="translate(${marker.x}, ${marker.y})">
            <circle r="22" fill="${markerType.color}"></circle>
            <text text-anchor="middle" dy="6">${markerType.icon}</text>
            <title>${safeLabel}</title>
          </g>
        `;
      })
      .join('');

    markerSummaryElement.innerHTML = buildSummaryMarkup();
    markerListElement.innerHTML = state.markers
      .map((marker) => {
        const markerType = markerTypeMap.get(marker.type) || markerTypes[0];
        return `
          <li>
            <span class="garden-plan-marker-chip" style="background:${markerType.color}">${markerType.icon}</span>
            <div>
              <strong>${escapeHtml(marker.label)}</strong>
              <p>${escapeHtml(markerType.label)} at (${Math.round(marker.x)}, ${Math.round(marker.y)})</p>
            </div>
            <button type="button" class="btn btn-secondary" data-remove-marker-id="${marker.id}">Remove</button>
          </li>
        `;
      })
      .join('');

    if (!state.markers.length) {
      markerListElement.innerHTML = '<li class="garden-plan-empty">No markers placed yet.</li>';
    }

    if (!state.isClosed) {
      setStatus(`Outline mode: ${state.points.length} point${state.points.length === 1 ? '' : 's'} plotted.`);
    } else if (state.mode === 'marker') {
      setStatus('Marker mode: click inside the shape to add a marker, or drag an existing marker.');
    } else {
      setStatus('Outline closed. Switch to marker mode to map planting zones.');
    }

    modeButtons.forEach((button) => {
      const isActive = button.getAttribute('data-plan-mode') === state.mode;
      button.classList.toggle('is-active', isActive);
    });
  }

  function buildSummaryMarkup() {
    if (!state.markers.length) {
      return '<p>No planned growing areas yet.</p>';
    }

    const counts = state.markers.reduce((summary, marker) => {
      summary[marker.type] = (summary[marker.type] || 0) + 1;
      return summary;
    }, {});

    return markerTypes
      .filter((markerType) => counts[markerType.value])
      .map((markerType) => `<p><strong>${counts[markerType.value]}</strong> ${escapeHtml(markerType.label)} marker${counts[markerType.value] === 1 ? '' : 's'}</p>`)
      .join('');
  }

  function setMode(nextMode) {
    state.mode = nextMode;
    persist();
  }

  function closeShape() {
    if (state.points.length < 3) {
      setStatus('You need at least three points to close the garden shape.');
      return;
    }

    state.isClosed = true;
    state.mode = 'marker';
    persist();
    render();
  }

  function undoPoint() {
    if (state.isClosed) {
      setStatus('Reset the plan if you want to redraw the outline.');
      return;
    }

    state.points.pop();
    persist();
    render();
  }

  function resetPlan() {
    state.mode = 'outline';
    state.points = [];
    state.isClosed = false;
    state.markers = [];
    persist();
    render();
  }

  function addMarker(point) {
    const selectedType = markerTypeElement.value;
    const markerType = markerTypeMap.get(selectedType) || markerTypes[0];
    const customLabel = markerLabelElement.value.trim();

    state.markers.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: selectedType,
      label: customLabel || markerType.label,
      x: point.x,
      y: point.y
    });

    markerLabelElement.value = '';
    persist();
    render();
  }

  function syncLabelPlaceholder() {
    const markerType = markerTypeMap.get(markerTypeElement.value) || markerTypes[0];
    markerLabelElement.placeholder = `Defaults to ${markerType.label}`;
  }

  function setStatus(message) {
    statusElement.textContent = message;
  }

  function getSvgPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    return {
      x: Number(transformedPoint.x.toFixed(1)),
      y: Number(transformedPoint.y.toFixed(1))
    };
  }

  function isPointInPolygon(point, polygon) {
    let inside = false;

    for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
      const current = polygon[index];
      const previous = polygon[previousIndex];
      const intersects = ((current.y > point.y) !== (previous.y > point.y))
        && (point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x);

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();