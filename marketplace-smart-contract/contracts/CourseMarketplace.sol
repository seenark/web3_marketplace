// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


contract CourseMarketplace {
  enum State {
    Purchased,
    Activated,
    Deactivated
  }

  struct Course {
    uint id; // 32 bytes
    uint price; // 32
    bytes32 proof; // 32
    address owner; // 20
    State state; // 1 byte
  }

  bool public isStopped = false;

  uint public a = 1;

  // mapping of courseHash to Course
  mapping(bytes32 => Course) private ownedCourse;

  // mapping of courseId to courseHash
  mapping(uint => bytes32) private ownedCourseHash;

  // number of all courses + id of the course
  uint private totalOwnedCourses;

  address payable private owner;

  constructor() {
    setContractOwner(msg.sender);
  }

   /// Course has invalid state!
  error InvalidState();

  /// Course is not created!
  error CourseIsNotCreated();

  /// Course already has owner!
  error CourseHasOwner();

  /// Sender is not course owner!
  error SenderIsNotCourseOwner();

  /// only owner can access!
  error OnlyOwner();

  modifier onlyOwner() {
    if (msg.sender != getContractOwner()) {
      revert OnlyOwner();
    }
    _;
  }

   modifier onlyWhenNotStopped {
    require(!isStopped, "Contract is Stopped");
    _;
  }

  modifier onlyWhenStopped {
    require(isStopped);
    _;
  }

  receive() external payable {}

  function withdraw(uint amount)
    external
    onlyOwner
  {
    (bool success, ) = owner.call{value: amount}("");
    require(success, "Transfer failed.");
  }

  function emergencyWithdraw()
    external
    onlyWhenStopped
    onlyOwner
  {
    (bool success, ) = owner.call{value: address(this).balance}("");
    require(success, "Transfer failed.");
  }

  function selfDestruct()
    external
    onlyWhenStopped
    onlyOwner
  {
    selfdestruct(owner);
  }

  function stopContract()
    external
    onlyOwner
  {
    isStopped = true;
  }

  function resumeContract()
    external
    onlyOwner
  {
    isStopped = false;
  }

  function purchaseCourse(bytes16 courseId, bytes32 proof) external payable onlyWhenNotStopped {
    bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));
    if (hasCourseOwnership(courseHash)) {
      revert CourseHasOwner();
    }

    uint id = totalOwnedCourses++;

    ownedCourseHash[id] = courseHash;
    ownedCourse[courseHash] = Course({
      id: id,
      price: msg.value,
      proof: proof,
      owner: msg.sender,
      state: State.Purchased
    });
  }

  function repurchaseCourse(bytes32 courseHash)
    external
    payable
    onlyWhenNotStopped
  {
    if (!isCourseCreated(courseHash)) {
      revert CourseIsNotCreated();
    }

    if (!hasCourseOwnership(courseHash)) {
      revert SenderIsNotCourseOwner();
    }

    Course storage course = ownedCourse[courseHash];

    if (course.state != State.Deactivated) {
      revert InvalidState();
    }

    course.state = State.Purchased;
    course.price = msg.value;
  }

  function activateCourse(bytes32 courseHash) external onlyOwner onlyWhenNotStopped {

    if (!isCourseCreated(courseHash)) {
      revert CourseIsNotCreated();
    }

    Course storage course = ownedCourse[courseHash];

    if (course.state != State.Purchased) {
      revert InvalidState();
    }

    course.state = State.Activated;
  }

   function deactivateCourse(bytes32 courseHash)
    external
    onlyOwner
    onlyWhenNotStopped
  {
    if (!isCourseCreated(courseHash)) {
      revert CourseIsNotCreated();
    }

    Course storage course = ownedCourse[courseHash];

    if (course.state != State.Purchased) {
      revert InvalidState();
    }

    (bool success, ) = course.owner.call{value: course.price}("");
    require(success, "Transfer failed!");

    course.state = State.Deactivated;
    course.price = 0;
  }

  function transferOwnership(address newOwner) external onlyOwner {
    setContractOwner(newOwner);
  }

  function getCourseCount() external view returns (uint) {
    return totalOwnedCourses;
  }

  function getCourseHashAtIndex(uint index) external view returns (bytes32) {
    return ownedCourseHash[index];
  }

  function getCourseByHash(bytes32 courseHash) external view returns (Course memory) {
    return ownedCourse[courseHash];
  }

  function getContractOwner() public view returns (address) {
    return owner;
  }

  function setContractOwner(address newOwner) private {
    owner = payable(newOwner);
  }

  function isCourseCreated(bytes32 courseHash) private view returns(bool) {
    return ownedCourse[courseHash].owner != address(0);
  }

  function hasCourseOwnership(bytes32 courseHash) private view returns (bool) {
    return ownedCourse[courseHash].owner == msg.sender;
  }
}
