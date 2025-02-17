/**
 * 모임 캘린더 컴포넌트
 *
 * 모임 방에서 사용되는 메인 캘린더 컴포넌트입니다.
 * RoomContext를 통해 모임 데이터와 상태를 관리하며,
 * 사용자가 선택한 시간대에 따라 적절한 캘린더 뷰를 표시합니다.
 *
 * 주요 기능:
 * - 모임의 시간대(연/월/주/일)에 따른 캘린더 뷰 표시
 * - 참여 가능한 시간대 시각화 (현재는 미구현, 추후 구현 예정)
 * - 날짜 선택 기능 (캘린더 컴포넌트에서 처리)
 */

import { FiCalendar } from 'react-icons/fi'; // react-icons 라이브러리에서 FiCalendar 아이콘을 import합니다. 캘린더 아이콘을 표시하기 위해 사용됩니다.
import Calendar from '@/features/calendar/Calendar'; // '@/features/calendar/Calendar' 경로에서 Calendar 컴포넌트를 import합니다. 실제 캘린더 UI를 렌더링하는 컴포넌트입니다.
import { useRoomContext } from '@/contexts/RoomContext'; // '@/contexts/RoomContext' 경로에서 useRoomContext 훅을 import합니다. RoomContext에서 제공하는 모임 관련 상태와 함수를 사용하기 위해 사용됩니다.
import { TIME_FRAME } from '@/constants/roomTypes'; // '@/constants/roomTypes' 경로에서 TIME_FRAME 상수를 import합니다. 모임 시간대 관련 상수 (YEAR, MONTH, WEEK 등)를 정의하고 있습니다.

function RoomCalendar() {
  // useRoomContext 훅을 사용하여 RoomContext에서 필요한 상태와 핸들러를 가져옵니다.
  const {
    room,             // 현재 모임 방의 정보를 담고 있는 상태입니다. (모임 제목, 시간대, 참여자 등) RoomContext에서 관리됩니다.
    selectedDate,     // 캘린더에서 현재 선택된 날짜를 나타내는 상태입니다. Date 객체 형태이며, RoomContext에서 관리됩니다.
    handleDateSelect  // 캘린더에서 날짜를 선택했을 때 실행되는 콜백 함수입니다. 선택된 날짜를 RoomContext의 selectedDate 상태에 업데이트하는 역할을 합니다.
  } = useRoomContext();

  return (
    // 캘린더 섹션 전체를 감싸는 컨테이너입니다.
    // w-2/3: 부모 컨테이너 너비의 2/3를 차지합니다.
    // p-4: padding을 4rem 적용하여 내부 콘텐츠와 여백을 만듭니다.
    // overflow-auto: 내용이 컨테이너를 넘칠 경우 스크롤바를 표시합니다.
    <div className="w-2/3 p-4 overflow-auto">
      {/* 캘린더 카드 컴포넌트입니다. 흰색 배경, 둥근 모서리, 그림자 효과, 애니메이션 효과를 적용했습니다. */}
      <div className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300">
        {/* 헤더 영역 컨테이너입니다. 캘린더 아이콘, 제목, 시간대 정보를 표시합니다. */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* 캘린더 아이콘 컨테이너입니다. 그라디언트 배경, 둥근 모서리, 그림자 효과를 적용했습니다. */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiCalendar className="w-5 h-5 text-white" /> {/* FiCalendar 아이콘을 흰색으로 표시합니다. */}
            </div>
            {/* 제목과 현재 선택된 시간대 정보를 표시하는 컨테이너입니다. */}
            <div>
              <h2 className="text-xl font-bold text-gray-900">일정 선택</h2> {/* "일정 선택" 제목을 굵게 표시합니다. */}
              {/* 현재 선택된 시간대 정보를 동적으로 표시하는 <p> 태그입니다. */}
              <p className="text-sm text-gray-500 mt-0.5">
                {/* room 상태의 timeFrame 값에 따라 다른 텍스트를 표시하는 조건부 렌더링입니다. */}
                {room?.timeFrame === TIME_FRAME.YEAR
                  ? `${room.specificYear}년` // timeFrame이 YEAR이면 "specificYear년" 형식으로 표시합니다.
                  : room?.timeFrame === TIME_FRAME.MONTH
                    ? `${room.specificYear || new Date().getFullYear()}년 ${room.specificMonth}월` // timeFrame이 MONTH이면 "specificYear년 specificMonth월" 형식으로 표시합니다. specificYear가 없으면 현재 년도를 사용합니다.
                    : room?.timeFrame === TIME_FRAME.WEEK
                      ? `${room.specificYear || new Date().getFullYear()}년 ${room.specificMonth}월 ${room.specificWeek}` // timeFrame이 WEEK이면 "specificYear년 specificMonth월 specificWeek" 형식으로 표시합니다. specificYear가 없으면 현재 년도를 사용합니다.
                      : '날짜를 선택해주세요' // timeFrame이 설정되지 않았거나 알 수 없는 경우 "날짜를 선택해주세요" 텍스트를 표시합니다.
                }
              </p>
            </div>
          </div>
        </div>
        {/* 캘린더 컴포넌트를 감싸는 래퍼 컨테이너입니다. 둥근 모서리, overflow hidden, 그림자 효과, 흰색 배경, 테두리 스타일을 적용했습니다. */}
        <div className="calendar-wrapper rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100">
          {/*
            Calendar 컴포넌트를 렌더링합니다.
            이 컴포넌트는 실제로 캘린더 UI를 표시하고 날짜 선택 기능을 제공합니다.
            각 props는 캘린더의 동작 방식과 표시 형태를 설정합니다.

            - viewType: 캘린더의 뷰 타입을 설정합니다. (연간, 월간, 주간, 일간) room 상태의 timeFrame 값을 사용하거나 기본값으로 YEAR (연간 뷰)를 사용합니다.
            - availableSlots: (현재 미구현) 캘린더에 참여 가능한 시간대를 시각적으로 표시하기 위한 데이터입니다.
            - startDate/endDate: (현재 미사용) 캘린더에서 선택 가능한 날짜 범위를 설정합니다. 모임 기간을 제한할 때 사용할 수 있습니다.
            - selectedYear: 연간 뷰에서 선택된 연도를 표시하기 위해 사용됩니다. room 상태의 specificYear 값을 정수형으로 변환하여 전달합니다.
            - selectedMonth: 월간 뷰에서 선택된 월을 표시하기 위해 사용됩니다. room 상태의 specificMonth 값을 정수형으로 변환하여 전달합니다.
            - selectedWeek: 주간 뷰에서 선택된 주를 표시하기 위해 사용됩니다. room 상태의 specificWeek 값을 전달합니다.
            - currentDate: 캘린더 컴포넌트의 현재 날짜를 설정합니다. RoomContext에서 관리하는 selectedDate 상태를 전달합니다.
            - onDateSelect: 캘린더에서 날짜를 선택했을 때 실행될 콜백 함수입니다. RoomContext의 handleDateSelect 함수를 그대로 전달하여 날짜 선택 시 RoomContext의 상태를 업데이트하도록 합니다.
          */}
          <Calendar
            viewType={room?.timeFrame || TIME_FRAME.YEAR}
            availableSlots={room?.availableSlots}
            startDate={room?.specificDate}
            endDate={room?.specificDate}
            selectedYear={room?.timeFrame === TIME_FRAME.YEAR ? parseInt(room.specificYear) : undefined}
            selectedMonth={room?.specificMonth ? parseInt(room.specificMonth) : undefined}
            selectedWeek={room?.specificWeek}
            currentDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default RoomCalendar; // RoomCalendar 컴포넌트를 export하여 다른 컴포넌트에서 사용할 수 있도록 합니다.