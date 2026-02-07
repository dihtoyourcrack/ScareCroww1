// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FreelanceEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        Created,
        Funded,
        Released,
        Refunded
    }

    struct Escrow {
        address client;
        address freelancer;
        uint256 amount;
        uint256 deadline;
        Status status;
    }

    IERC20 public immutable usdc;
    uint256 public escrowCounter;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(
        uint256 indexed id,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        uint256 deadline
    );
    event EscrowDeposited(uint256 indexed id, uint256 amount);
    event EscrowReleased(uint256 indexed id, address indexed freelancer, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address indexed client, uint256 amount);

    modifier onlyClient(uint256 id) {
        require(escrows[id].client == msg.sender, "Not client");
        _;
    }

    modifier onlyFreelancer(uint256 id) {
        require(escrows[id].freelancer == msg.sender, "Not freelancer");
        _;
    }

    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC");
        usdc = IERC20(_usdc);
    }

    function createEscrow(
        address freelancer,
        uint256 amount,
        uint256 duration
    ) external returns (uint256 id) {
        require(freelancer != address(0), "Invalid freelancer");
        require(amount > 0, "Invalid amount");
        require(duration > 0, "Invalid duration");
        require(freelancer != msg.sender, "Cannot escrow to self");

        id = escrowCounter++;
        uint256 deadline = block.timestamp + duration;

        escrows[id] = Escrow({
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            deadline: deadline,
            status: Status.Created
        });

        emit EscrowCreated(id, msg.sender, freelancer, amount, deadline);
    }

    function deposit(uint256 id) external nonReentrant {
        Escrow storage escrow = escrows[id];
        require(escrow.status == Status.Created, "Invalid status");
        require(msg.sender == escrow.client, "Not client");

        escrow.status = Status.Funded;
        usdc.safeTransferFrom(msg.sender, address(this), escrow.amount);

        emit EscrowDeposited(id, escrow.amount);
    }

    function release(uint256 id) external nonReentrant {
        Escrow storage escrow = escrows[id];
        require(escrow.status == Status.Funded, "Invalid status");
        require(msg.sender == escrow.client, "Not client");

        escrow.status = Status.Released;
        usdc.safeTransfer(escrow.freelancer, escrow.amount);

        emit EscrowReleased(id, escrow.freelancer, escrow.amount);
    }

    function refund(uint256 id) external nonReentrant {
        Escrow storage escrow = escrows[id];
        require(escrow.status == Status.Funded, "Invalid status");
        require(
            msg.sender == escrow.client || block.timestamp >= escrow.deadline,
            "Not authorized"
        );

        escrow.status = Status.Refunded;
        usdc.safeTransfer(escrow.client, escrow.amount);

        emit EscrowRefunded(id, escrow.client, escrow.amount);
    }

    function getEscrow(uint256 id) external view returns (Escrow memory) {
        return escrows[id];
    }
}
