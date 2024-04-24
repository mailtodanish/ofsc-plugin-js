var A = function () {
  this.x = true;
  this.z = function () {
    console.error("function Z>>", this);
  };
};

// In this case, variable A is assigned a value that is a reference to a function.
// When that function is called using A(), the function's this isn't set by the call
// so it defaults to the global object
// A();

A.prototype.y = function () {
  console.error("function Y>>", this);
};

const c = new A();
// When that function is called using new A(), the function's this is set by the call
// It will not show prototype
c.y();
