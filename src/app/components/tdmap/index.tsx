import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Spin, Input, List, Card } from "antd";
import { APP_CONFIG_KEYS, getAppConfigFromCache } from '@/hooks';
import './style.css';
import { IGeoCoordinate } from "@/models/catalogs";

const { Search } = Input;

interface MapProps {
    onLocationChange?: (coordinates: IGeoCoordinate & { location: google.maps.LatLngLiteral; address?: string }) => void;
    height?: string | number;
    zoom?: number;
    disabled?: boolean;
    showStreetView?: boolean;
    showMapType?: boolean;
    showSearch?: boolean; // Có hiển thị search box không
    searchPlaceholder?: string;
    initialLocation?: IGeoCoordinate | null; // Thêm prop để set vị trí ban đầu
}

interface PlaceResult {
    place_id: string;
    description: string;
    geometry?: google.maps.places.PlaceGeometry;
}

// Enhanced default location với multiple fallbacks
const getDefaultLocation = (): google.maps.LatLngLiteral => {
    // 1. Thử lấy từ config
    const locationConfig = getAppConfigFromCache(APP_CONFIG_KEYS.DEFAULT_LOCATION);
    if (locationConfig?.value) {
        try {
            const [lat, lng] = locationConfig.value.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lng };
            }
        } catch {
            // Continue to next fallback
        }
    }

    // 2. Thử lấy từ province config (tính toán center)
    const provinceConfig = getAppConfigFromCache(APP_CONFIG_KEYS.PROVINCE_CODE);
    if (provinceConfig?.value) {
        // Map province codes to approximate center coordinates
        const provinceLocations: Record<string, google.maps.LatLngLiteral> = {
            'HN': { lat: 21.0285, lng: 105.8542 }, // Hà Nội
            'HCM': { lat: 10.8231, lng: 106.6297 }, // TP.HCM
            'DN': { lat: 16.0471, lng: 108.2068 }, // Đà Nẵng
            'HP': { lat: 20.8609, lng: 106.6830 }, // Hải Phòng
            // Thêm các tỉnh khác...
        };

        const provinceLocation = provinceLocations[provinceConfig.value];
        if (provinceLocation) {
            return provinceLocation;
        }
    }

    // 3. Fallback cuối cùng - Hà Nội
    return { lat: 21.0285, lng: 105.8542 };
};

const TDMap: React.FC<MapProps> = ({
    onLocationChange,
    height = "350px",
    zoom = 15,
    disabled = false,
    showStreetView = false,
    showMapType = false,
    showSearch = true,
    searchPlaceholder = "Tìm kiếm địa điểm...",
    initialLocation = null
}) => {
    // Determine initial location từ props hoặc default
    const getInitialLocation = useCallback((): google.maps.LatLngLiteral => {
        if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
            return {
                lat: initialLocation.latitude,
                lng: initialLocation.longitude
            };
        }
        return getDefaultLocation();
    }, [initialLocation]);

    const [location, setLocation] = useState<google.maps.LatLngLiteral>(getInitialLocation);
    const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [isSelectingPlace, setIsSelectingPlace] = useState(false); // Flag để tránh search lại khi chọn

    // Update location khi initialLocation thay đổi từ bên ngoài
    useEffect(() => {
        if (initialLocation && initialLocation.latitude && initialLocation.longitude) {
            const newLocation = {
                lat: initialLocation.latitude,
                lng: initialLocation.longitude
            };
            setLocation(newLocation);
        }
    }, [initialLocation]);

    // Refs for Google services
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const geocoder = useRef<google.maps.Geocoder | null>(null);
    const isSelectingRef = useRef(false); // Ref để tránh race condition

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
        language: "vi",
        region: "VN",
        libraries: ["places"] // Thêm Places library
    });

    // Initialize Google services when map loads
    const onMapLoad = useCallback((map: google.maps.Map) => {
        placesService.current = new google.maps.places.PlacesService(map);
        geocoder.current = new google.maps.Geocoder();
    }, []);

    // Search places function
    const searchPlaces = useCallback((query: string) => {
        if (!placesService.current || !query.trim()) {
            setSearchResults([]);
            return;
        }

        const request: google.maps.places.TextSearchRequest = {
            query: query,
            location: location,
            radius: 50000, // 50km radius
            language: 'vi',
            region: 'VN'
        };

        placesService.current.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const mappedResults: PlaceResult[] = results.slice(0, 5).map(place => ({
                    place_id: place.place_id!,
                    description: place.name || place.formatted_address || '',
                    geometry: place.geometry
                }));
                setSearchResults(mappedResults);
                setShowResults(true);
            } else {
                setSearchResults([]);
            }
        });
    }, [location]);

    // Handle search input change with debounce
    useEffect(() => {

        // Nếu đang trong quá trình chọn place, không search
        if (isSelectingPlace || isSelectingRef.current) {
            console.log('Skipping search - isSelectingPlace or ref is true');
            setIsSelectingPlace(false);
            return;
        }

        if (!searchValue.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            console.log('Executing search for:', searchValue);
            searchPlaces(searchValue);
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchValue, searchPlaces, isSelectingPlace]);

    // Get address from coordinates (reverse geocoding)
    const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
        if (!geocoder.current) return '';

        try {
            const response = await geocoder.current.geocode({
                location: { lat, lng },
                language: 'vi',
                region: 'VN'
            });

            if (response.results && response.results.length > 0) {
                return response.results[0].formatted_address;
            }
        } catch (error) {
            console.warn('Reverse geocoding failed:', error);
        }
        return '';
    }, []);

    // Handle place selection from search results
    const handlePlaceSelect = useCallback(async (place: PlaceResult) => {
        if (!place.geometry?.location) return;

        console.log('handlePlaceSelect called, hiding dropdown immediately');

        // Set ref để ngăn search effect
        isSelectingRef.current = true;

        // Ngay lập tức ẩn dropdown và clear kết quả để tránh hiển thị lại
        setShowResults(false);
        setSearchResults([]);
        setIsSelectingPlace(true);

        const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        };

        setLocation(newLocation);
        setSearchValue(place.description);
        setCurrentAddress(place.description);

        // Reset ref sau một chút
        setTimeout(() => {
            isSelectingRef.current = false;
        }, 100);

        // Notify parent component
        if (onLocationChange) {
            onLocationChange({
                latitude: newLocation.lat,
                longitude: newLocation.lng,
                location: newLocation,
                //address: place.description
            });
        }
    }, [onLocationChange]);

    // Memoize container style
    const mapContainerStyle = useMemo(
        () => ({
            width: "100%",
            height: typeof height === 'number' ? `${height}px` : height,
            opacity: disabled ? 0.6 : 1,
            pointerEvents: (disabled ? 'none' : 'auto') as 'auto' | 'none'
        }),
        [height, disabled]
    );

    // Memoize map options
    const mapOptions = useMemo(() => ({
        streetViewControl: showStreetView,
        mapTypeControl: showMapType,
        fullscreenControl: true,
        zoomControl: !disabled,
        scrollwheel: !disabled,
        disableDoubleClickZoom: disabled,
    }), [showStreetView, showMapType, disabled]);

    // Optimized map click handler with reverse geocoding
    const handleMapClick = useCallback(
        async (event: google.maps.MapMouseEvent) => {
            if (!event.latLng || disabled) return;

            const newLocation = {
                lat: parseFloat(event.latLng.lat().toFixed(6)),
                lng: parseFloat(event.latLng.lng().toFixed(6)),
            };

            // Update internal state
            setLocation(newLocation);
            setShowResults(false);

            // Get address for the clicked location
            const address = await getAddressFromCoordinates(newLocation.lat, newLocation.lng);
            if (address) {
                setCurrentAddress(address);
                setSearchValue(''); // Clear search when clicking on map
            }

            // Notify parent component
            if (onLocationChange) {
                onLocationChange({
                    latitude: newLocation.lat,
                    longitude: newLocation.lng,
                    location: newLocation,
                    //address: address || currentAddress
                });
            }
        },
        [onLocationChange, disabled, getAddressFromCoordinates, currentAddress]
    );

    // Handle click outside to close search results
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.map-container')) {
                setShowResults(false);
            }
        };

        if (showResults) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showResults]);

    if (loadError) {
        return (
            <div className="map-error p-4 text-center border border-danger rounded">
                <i className="fa fa-exclamation-triangle text-danger"></i>
                <p className="mt-2 mb-0">Không thể tải bản đồ. Vui lòng kiểm tra kết nối mạng.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="map-loading d-flex justify-content-center align-items-center"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="map-container position-relative">
            {/* Search Box */}
            {showSearch && !disabled && (
                <div className="search-box-container position-absolute top-0 start-0 p-2" style={{ zIndex: 1000 }}>
                    <div className="position-relative">
                        <Search
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => {
                                // Chỉ hiển thị results nếu có kết quả và không đang trong quá trình chọn place
                                if (searchResults.length > 0 && !isSelectingPlace) {
                                    setShowResults(true);
                                }
                            }}
                            onBlur={() => {
                                // Delay hiding to allow click on results
                                setTimeout(() => {
                                    setShowResults(false);
                                }, 200);
                            }}
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            allowClear
                        />

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <Card
                                className="search-results-dropdown position-absolute w-100 mt-1"
                                bodyStyle={{ padding: 0 }}
                                style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    zIndex: 1001,
                                }}
                            >
                                <List
                                    size="small"
                                    dataSource={searchResults}
                                    renderItem={(item) => (
                                        <List.Item
                                            className="cursor-pointer hover-bg-light px-3 py-2"
                                            onClick={() => handlePlaceSelect(item)}
                                            onMouseDown={(e) => {
                                                // Ngăn chặn onBlur của search input
                                                e.preventDefault();
                                            }}
                                            style={{ borderBottom: '1px solid #f0f0f0' }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <i className="fa fa-map-marker-alt text-primary me-2"></i>
                                                <span className="text-truncate">{item.description}</span>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Current Address Display */}
            {currentAddress && (
                <div className="address-display position-absolute bottom-0 start-0 p-2" style={{ zIndex: 1000 }}>
                    <div className="bg-white rounded px-3 py-2 shadow-sm border">
                        <small className="text-muted">📍 Địa chỉ hiện tại:</small>
                        <div className="fw-bold text-truncate">{currentAddress}</div>
                    </div>
                </div>
            )}

            {disabled && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1000 }}>
                    <span className="text-muted">Bản đồ đang bị vô hiệu hóa</span>
                </div>
            )}
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location}
                zoom={zoom}
                onClick={handleMapClick}
                options={mapOptions}
                onLoad={onMapLoad}
            >
                <Marker
                    position={location}
                    draggable={!disabled}
                    onDragEnd={handleMapClick}
                />
            </GoogleMap>
        </div>
    );
};

export default TDMap;
