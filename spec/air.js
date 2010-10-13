foo.require = (function () {
  var _requires  = {};
  var _translate = function(str){
    var tvars = foo.suite;
    return str.replace(/:(\w+)/g, function(match, ref){
        return tvars[ref];
      });
    };

  return function (path){
    path = _translate(path); 
    if (_requires[path]) return;

    console.debug('loading path: ' + path);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, false);
    xhr.send(null);
    if (xhr.status == 200){
      try {
        window.eval.call(window, xhr.responseText);
      } catch (e){
        throw new Error('Could not eval file ' + path + ": " + e.message);
      }
    } else {
      throw new Error('Could not find file: ' + path);
    }

    _requires[path] = true;
  }
})();


// TODO: Make report template configurable
// foo.suite.template = 'mytemplate.html';
foo.unit.report = function (example){
  function formatStack(stack){
    return '<pre>' + stack.join("\n\t") + '</pre>';
  }

  var node = document.createElement('div');
  var description = example.getFullDescription();
  if (example.isSuccess()){
    node.className = 'pass';
    node.innerHTML = '<div class="description">' + description + '</div>';
  } else {
    node.className = 'fail';
    var html = '<div class="description">' + description + '</div>';
    html += '<div class="failure-message">' + example.getMessage() + '<br />' + formatStack(example.getStack()) + '</div>';
    node.innerHTML = html;
  }
  var reportNode = document.getElementById('results');
  reportNode.appendChild(node);
}

foo.unit.run = function (runners){
  runners = runners || foo.unit.build();
  for (var i = 0, ii = runners.length; i < ii; ++i){
    var runner = runners[i];
    runner.run();
    foo.unit.report(runner);
  }
}