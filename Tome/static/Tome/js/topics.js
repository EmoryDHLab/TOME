/*
  The topic object used to represent topics loaded into the system
*/
var TopicList = function () {
  this.count = 0;
  this.selected = [];
  this.colors = [
    "#d0011b", //red
    "#f6a623", //orange
    "#8b572a", //brown
    "#4990e2", //blue
    "#bd0fe1", //violet
    "#f33dd3", //pink
    "#417505", //green
    "#9012fe", //purple
    "#7ed321", //light-green
    "#50e3c2"  //teal?
  ];
  this.defaultColor = "#d8d8d8";
  this.averageColor = "#000000";
}
TopicList.prototype.getSelected = function() {
  return this.selected;
};
TopicList.prototype.getColor = function(k) {
  k = parseInt(k);
  if (k == -1) {
    return this.averageColor;
  }
  return this.colors[this.getSelected().indexOf(k)]
};
TopicList.prototype.add = function(k) {
  k = parseInt(k);
  if (this.contains(k)) {
    console.log("Already in it.");
    return;
  }
  if (this.count == 10){
    console.log("Too many.");
    return;
  }
  if (this.count < this.getSelected().length){
    for (i = 0; i < this.getSelected().length; i++) {
      if (this.getSelected()[i] == undefined) {
        this.getSelected()[i] = k;
        console.log("placed");
        break;
      }
    }
  } else {
    console.log("placed");
    this.getSelected().push(k);
  }
  this.count++;
};

TopicList.prototype.addAll = function (keys) {
  for (var i = 0; i < keys.length; i++) {
    this.add(parseInt(keys[i]));
  }
};

TopicList.prototype.full = function() {
  return this.count == 10;
};

TopicList.prototype.contains = function(k) {
  k = parseInt(k);
  return this.getSelected().indexOf(k) != -1;
}

  //works for both topTen and selected
TopicList.prototype.addOrGet = function(k) {
  k = parseInt(k);
  var tempCol = this.add(k);
  if (tempCol == undefined) {
    return this.getColor(k)
  }
  return tempCol;
};

TopicList.prototype.deleteSelected = function(k) {
  k = parseInt(k);
  i = this.getSelected().indexOf(k);
  console.log(i);
  if (i > -1) {
      this.getSelected()[i] = undefined;
      this.count--;
  }
};

TopicList.prototype.nextColor = function() {
  var ind = 0;
  if (this.count < this.getSelected().length){
    for (i = 0; i < this.getSelected().length; i++) {
      if (this.getSelected()[i] == undefined) {
        ind = i;
        break;
      }
    }
  } else {
    ind = this.count;
  }
  return this.colors[ind];
};

TopicList.prototype.clear = function() {
  this.count = 0;
  this.selected = [];
}

// gets all topics in selection as objects, not just keys.
// tRef is the list of objects to be used to translate the key into the object
TopicList.prototype.getSelectedAsTopics = function(tRef) {
  var preSelected = [];
  for (var i = 0; i < this.getSelected().length; i++) {
    var tp = this.getSelected()[i];
    var t = tRef.find(function (t) { return tp == t.key });
    if (t != undefined) {
      preSelected.push(t);
    }
  }
  return preSelected;
}

TopicList.prototype.empty = function() {
  return this.count == 0;
}

TopicList.prototype.getKeys = function() {
  return this.getSelected().reduce(function (r, a) {
        if (a != undefined) {
            r.push(a);
        }
        return r;
    }, []);
}

TopicList.prototype.copyFrom = function(keys) {
  console.log(keys);
  this.clear();
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] != undefined) {
      this.count++;
    }
    this.selected[i] = keys[i];
  }
}
