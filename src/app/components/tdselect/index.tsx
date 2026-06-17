import { Empty, Select, SelectProps } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import debounce from 'lodash/debounce';
import { useMemo, useRef, useState } from 'react';

interface TDSelectProps extends Omit<SelectProps, 'options'> {
  reload?: boolean;
  showSearch?: boolean;
  fetchOptions: (search: string | null) => Promise<DefaultOptionType[]>;
  debounceTimeout?: number;
}

const TDSelect: React.FC<TDSelectProps> = ({ reload = false, showSearch = false, fetchOptions, debounceTimeout = 800, ...props }) => {
  const [fetching, setFetching] = useState<boolean>(false);
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const fetchRef = useRef<number>(0);
  const fetchFirstRef = useRef<boolean>(true);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string): void => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value)
        .then(newOptions => {
          if (fetchId !== fetchRef.current) {
            return;
          }
          setOptions(newOptions);
        })
        .catch(error => {
          console.error('Error fetching options:', error);
        })
        .finally(() => {
          setFetching(false);
        });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const debounceFetcherFirst = useMemo(() => {
    const loadOptions = (open: boolean): void => {
      if (open && (fetchFirstRef.current || options.length === 0 || reload)) {
        fetchFirstRef.current = false;
        setOptions([]);
        setFetching(true);

        fetchOptions(null)
          .then(newOptions => {
            setOptions(newOptions);
          })
          .catch(error => {
            console.error('Error fetching initial options:', error);
          })
          .finally(() => {
            setFetching(false);
          });
      }
    };
    return debounce(loadOptions, 10);
  }, [options.length, reload, fetchOptions]);

  return (
    <Select
      style={{ width: '100%' }}
      filterOption={false}
      defaultActiveFirstOption={false}
      allowClear
      showSearch={showSearch}
      labelInValue
      onSearch={showSearch ? debounceFetcher : undefined}
      notFoundContent={fetching ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy dữ liệu" /> : null}
      {...props}
      options={options}
      onDropdownVisibleChange={debounceFetcherFirst}
    />
  );
};

export default TDSelect;
