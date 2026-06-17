import React from 'react';
import { useAppConfigs } from '@/hooks/useAppConfigs';
import { CommonConfigs, createAppConfigs, createMutableAppConfigs } from '@/hooks/appConfigHelpers';

// Ví dụ 1: Sử dụng predefined common configs
const ExampleWithCommonConfigs = () => {
    const {
        provinceCode,
        defaultLocation,
        loading,
        refetch
    } = useAppConfigs({
        configs: CommonConfigs.ALL_ESSENTIAL
    });

    return (
        <div>
            <h3>Using Common Configs:</h3>
            {loading ? (
                <p>Loading province and location...</p>
            ) : (
                <div>
                    <p>Province: {provinceCode?.value}</p>
                    <p>Location: {defaultLocation?.value}</p>
                    <button onClick={refetch}>Refetch</button>
                </div>
            )}
        </div>
    );
};

// Ví dụ 1b: Alternative nếu gặp lỗi với readonly arrays
const ExampleWithCommonConfigsAlt = () => {
    const {
        provinceCode,
        defaultLocation,
        loading,
        refetch
    } = useAppConfigs({
        configs: createMutableAppConfigs([
            { key: 'App_Province_Code', alias: 'provinceCode' },
            { key: 'App_Default_Location', alias: 'defaultLocation' }
        ] as const)
    });

    return (
        <div>
            <h3>Using Common Configs (Alternative):</h3>
            {loading ? (
                <p>Loading province and location...</p>
            ) : (
                <div>
                    <p>Province: {provinceCode?.value}</p>
                    <p>Location: {defaultLocation?.value}</p>
                    <button onClick={refetch}>Refetch</button>
                </div>
            )}
        </div>
    );
};// Ví dụ 2: Tạo custom configs với helper
const ExampleWithCustomConfigs = () => {
    const customConfigs = createAppConfigs([
        { key: 'App_Company_Name', alias: 'companyName' },
        { key: 'App_Contact_Email', alias: 'contactEmail' },
        { key: 'App_Support_Phone', alias: 'supportPhone' }
    ] as const);

    const {
        companyName,
        contactEmail,
        supportPhone,
        loading
    } = useAppConfigs({
        configs: customConfigs
    });

    return (
        <div>
            <h3>Custom Company Configs:</h3>
            {loading ? (
                <p>Loading company information...</p>
            ) : (
                <div>
                    <p>Company: {companyName?.value}</p>
                    <p>Email: {contactEmail?.value}</p>
                    <p>Phone: {supportPhone?.value}</p>
                </div>
            )}
        </div>
    );
};



export {
    ExampleWithCommonConfigs,
    ExampleWithCommonConfigsAlt,
    ExampleWithCustomConfigs,
};