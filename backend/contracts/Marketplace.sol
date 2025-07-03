// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    IERC20 public immutable tokenERC20;

    struct Listing {
        address seller;
        address nftContract;
        uint256 price;
        bool active;
    }

    // Mapping para listados: nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;  
    // Mapping para ganancias pendientes de retiro
    mapping(address => uint256) public pendingWithdrawals;
    // Mapping para preferencia de pago diferido
    mapping(address => bool) public preferDeferred;

    // Eventos
    event NFTListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTSold(
        address indexed buyer,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    event ListingCanceled(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );
    event PriceUpdated(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );
    event Withdrawal(
        address indexed seller,
        uint256 amount
    );
    event PaymentPreferenceChanged(
        address indexed seller,
        bool preferDeferred
    );

    // --- Modificadores ---
    modifier validNFTContract(address nftContract) {
        require(nftContract != address(0), "Marketplace: Contrato NFT invalido");
        _;
    }

    modifier validPrice(uint256 price) {
        require(price > 0, "Marketplace: El precio debe ser mayor a cero");
        _;
    }

    modifier onlyListingOwner(address nftContract, uint256 tokenId) {
        require(
            listings[nftContract][tokenId].seller == msg.sender,
            "Marketplace: No eres el vendedor de este NFT"
        );
        _;
    }

    modifier listingExists(address nftContract, uint256 tokenId) {
        require(
            listings[nftContract][tokenId].active,
            "Marketplace: Este NFT no esta listado"
        );
        _;
    }

    /**
     * @dev Constructor que establece el token ERC20 para pagos
     * @param _tokenERC20 Dirección del token ERC20 para pagos
     */
    constructor(address _tokenERC20) Ownable(msg.sender) {
        require(_tokenERC20 != address(0), "Marketplace: Token ERC20 invalido");
        tokenERC20 = IERC20(_tokenERC20);
    }

    /**
     * @notice Lista un NFT para la venta
     * @dev El vendedor debe aprobar este contrato para transferir el NFT
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token a vender
     * @param price Precio de venta en tokens ERC20
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external validNFTContract(nftContract) validPrice(price) {
        IERC721 nft = IERC721(nftContract);
        
        // Verificar propiedad del NFT
        require(
            nft.ownerOf(tokenId) == msg.sender,
            "Marketplace: No eres el propietario de este NFT"
        );

        // Verificar que el NFT no esté ya listado
        require(
            !listings[nftContract][tokenId].active,
            "Marketplace: Este NFT ya esta listado"
        );

        // Verificar aprobación
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace: El contrato no esta aprobado para transferir este NFT"
        );

        // Crear el listado
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            price: price,
            active: true
        });

        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }

    /**
     * @notice Compra un NFT listado
     * @dev El comprador debe aprobar este contrato para transferir tokens ERC20
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token a comprar
     */
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant listingExists(nftContract, tokenId) {
        Listing memory listing = listings[nftContract][tokenId];
        
        // Verificar que el comprador no sea el vendedor
        require(
            listing.seller != msg.sender,
            "Marketplace: No puedes comprar tu propio NFT"
        );

        IERC721 nft = IERC721(nftContract);
        
        // Verificar que el vendedor sigue siendo el propietario
        require(
            nft.ownerOf(tokenId) == listing.seller,
            "Marketplace: El vendedor ya no es propietario del NFT"
        );

        // Verificar que el contrato sigue aprobado
        require(
            nft.getApproved(tokenId) == address(this) ||
                nft.isApprovedForAll(listing.seller, address(this)),
            "Marketplace: El contrato ya no esta aprobado para transferir este NFT"
        );

        // Transferir tokens ERC20 del comprador al contrato
        require(
            tokenERC20.transferFrom(msg.sender, address(this), listing.price),
            "Marketplace: Transferencia de tokens ERC20 fallida"
        );

        // Procesar pago según la preferencia del vendedor
        if (preferDeferred[listing.seller]) {
            // Sistema diferido: acumular en pendingWithdrawals
            pendingWithdrawals[listing.seller] += listing.price;
        } else {
            // Pago directo: transferir inmediatamente al vendedor
            require(
                tokenERC20.transfer(listing.seller, listing.price),
                "Marketplace: Transferencia directa al vendedor fallida"
            );
        }

        // Eliminar el listado ANTES de transferir el NFT (prevención de reentrancia)
        delete listings[nftContract][tokenId];

        // Transferir el NFT del vendedor al comprador
        nft.safeTransferFrom(listing.seller, msg.sender, tokenId, "");

        emit NFTSold(msg.sender, listing.seller, nftContract, tokenId, listing.price);
    }

    /**
     * @notice Cancela un listado activo
     * @dev Solo el vendedor puede cancelar su propio listado
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token a deslistar
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external onlyListingOwner(nftContract, tokenId) listingExists(nftContract, tokenId) {
        delete listings[nftContract][tokenId];
        emit ListingCanceled(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Actualiza el precio de un NFT listado
     * @dev Solo el vendedor puede actualizar el precio
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token
     * @param newPrice Nuevo precio en tokens ERC20
     */
    function updatePrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external validPrice(newPrice) onlyListingOwner(nftContract, tokenId) listingExists(nftContract, tokenId) {
        uint256 oldPrice = listings[nftContract][tokenId].price;
        listings[nftContract][tokenId].price = newPrice;
        
        emit PriceUpdated(msg.sender, nftContract, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Retira las ganancias acumuladas
     * @dev Transfiere todos los tokens ERC20 pendientes al vendedor
     */
    function retirarGanancias() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Marketplace: No hay ganancias para retirar");

        // Resetear balance ANTES de transferir (prevención de reentrancia)
        pendingWithdrawals[msg.sender] = 0;

        // Transferir tokens ERC20
        require(
            tokenERC20.transfer(msg.sender, amount),
            "Marketplace: Transferencia de tokens ERC20 fallida"
        );

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @notice Obtiene información de un listado
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token
     * @return Información completa del listado
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    /**
     * @notice Verifica si un NFT está listado
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del token
     * @return true si está listado y activo
     */
    function isListed(
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        return listings[nftContract][tokenId].active;
    }

    /**
     * @notice Obtiene el balance de ganancias pendientes de un vendedor
     * @param seller Dirección del vendedor
     * @return Cantidad de tokens ERC20 pendientes de retiro
     */
    function getPendingWithdrawals(address seller) external view returns (uint256) {
        return pendingWithdrawals[seller];
    }

    /**
     * @notice Establece la preferencia de pago del vendedor
     * @param _preferDeferred true para pagos diferidos, false para pagos inmediatos
     */
    function setPaymentPreference(bool _preferDeferred) external {
        preferDeferred[msg.sender] = _preferDeferred;
        emit PaymentPreferenceChanged(msg.sender, _preferDeferred);
    }

    /**
     * @notice Obtiene la preferencia de pago de un vendedor
     * @param seller Dirección del vendedor
     * @return true si prefiere pagos diferidos, false si prefiere pagos inmediatos
     */
    function getPaymentPreference(address seller) external view returns (bool) {
        return preferDeferred[seller];
    }
}