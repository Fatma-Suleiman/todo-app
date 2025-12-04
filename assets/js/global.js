function renderComponent(elements) {
  const promises = Array.from(elements).map((element) => {
    const dataImport = element.getAttribute("data-import");
    return fetch(dataImport)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then((component) => {
        element.innerHTML = component;
        // Wait for scripts to load before continuing
        return loadComponentScripts(element).then(() => {
          const nested = element.querySelectorAll("[data-import]");
          if (nested.length) {
            return renderComponent(nested);
          }
          return Promise.resolve();
        });
      })
      .catch((err) => {
        element.innerHTML = `<h4>Component not found</h4>`;
        return Promise.resolve();
      });
  });

  return Promise.all(promises);
}

function loadComponentScripts(element) {
  const scripts = element.querySelectorAll("script");
  const promises = [];

  for (let script of scripts) {
    const newScript = document.createElement("script");

    if (script.type) newScript.type = script.type;

    if (script.src) {
      newScript.src = script.src;
      newScript.async = false;
      const p = new Promise((resolve, reject) => {
        newScript.onload = resolve;
        newScript.onerror = reject;
      });
      promises.push(p);
    }

    if (script.textContent) newScript.textContent = script.textContent;

    script.remove();
    document.body.appendChild(newScript);
  }

  // Return a promise that resolves when all scripts are loaded
  return Promise.all(promises);
}

// Run after DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  const componentElements = document.querySelectorAll("[data-import]");
  renderComponent(componentElements).then(() => {
    // These run after scripts in components are fully loaded
    if (typeof window.initAuth === "function") {
      try { window.initAuth(); } 
      catch (err) { console.error("initAuth threw an error:", err); }
    }

    if (typeof window.initDashboard === "function") {
      try { window.initDashboard(); } 
      catch (err) { console.error("initDashboard threw an error:", err); }
    }

    if (typeof window.initProfile === "function") {
      try { window.initProfile(); } 
      catch (err) { console.error("initProfile error:", err); }
    }

    (function setupSpaNav() {
      if (window.__spaNavSetup) return;
      window.__spaNavSetup = true;

      document.addEventListener('click', (e) => {
        const a = e.target.closest('.navbar a');
        if (!a) return;

        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;

        e.preventDefault();
        const view = href.slice(1); 

        if (typeof showView === 'function') {
          try { showView(view); }
          catch (err) { console.error('showView threw:', err); }
        }

        try {
          history.replaceState(null, '', '#' + view);
        } catch {
          location.hash = '#' + view;
        }
      }, true);

      const initial = location.hash.replace('#','');
      if (initial && typeof showView === 'function') {
        try { showView(initial); }
        catch (err) { console.error('showView initial failed:', err); }
      }
    })();

  });
});
